import puppeteer from 'puppeteer';

import Jadwal from '../models/jadwalModels';

export function hello(_, res) {
  res.send({ hello: 'world' });
}

export async function scrapIlkom(_, res) {
  const result = await scrap(process.env.TARGET_SCHEDULE_PAGE_ILKOM);

  if (result.error) {
    res.send({ error: result.error, message: 'Failed to scrap the schedule' });
  } else {
    Jadwal.findOneAndUpdate(
      { majorId: 'ilkom' },
      {
        majorId: 'ilkom',
        ...result,
      },
      { new: true, upsert: true },
      (error, newSchedule) => {
        if (error) {
          res.send({ error, message: 'Error in updating the newly scrapped data' });
        } else {
          res.send(newSchedule);
        }
      }
    );
  }
}

export async function scrapSI(_, res) {
  const result = await scrap(process.env.TARGET_SCHEDULE_PAGE_SI);

  if (result.error) {
    res.send({ error: result.error, message: 'Failed to scrap the schedule' });
  } else {
    Jadwal.findOneAndUpdate(
      { majorId: 'si' },
      {
        majorId: 'si',
        ...result,
      },
      { new: true, upsert: true },
      (error, newSchedule) => {
        if (error) {
          res.send({ error, message: 'Error in updating the newly scrapped data' });
        } else {
          res.send(newSchedule);
        }
      }
    );
  }
}

async function scrap(targetPage) {
  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    await page.goto(process.env.TARGET_SITE);

    await page.type('input[name=u]', process.env.USERNAME, { delay: 100 });
    await page.type('input[name=p]', process.env.PASSWORD, { delay: 100 });
    await page.click('input[type=submit]', form => form.submit());

    await page.waitForNavigation();

    await page.goto(targetPage);

    const semester = await page.$eval('div.toolbar select', select => select.options[select.selectedIndex].textContent);

    const results = await page.$$eval('table.box tbody tr', elements => {
      return elements
        .slice(4)
        .map(el => {
          if (el.className === '') {
            const baseEl = el.querySelector('th');
            const regexSKSTerm = /([0-9]+) SKS, Term ([0-9]+)/;
            const raw = baseEl.textContent.trim();
            const [courseId, dashRest] = raw.split(' - ');
            const [courseName] = dashRest.split(' (');
            const [_, courseSKS, courseTerm] = regexSKSTerm.exec(raw);
            const [__, curriculumAndPrereq] = raw.split(';');
            const [courseCurriculum, coursePrerequisite] = curriculumAndPrereq.split('Prasyarat:');
      
            return {
              courseId,
              courseName,
              courseSKS,
              courseTerm,
              courseCurriculum: courseCurriculum.trim().replace('Kurikulum ', ''),
              coursePrerequisite: coursePrerequisite.trim(),
            };
          }

          const classInfos = el.querySelectorAll('td');
          const className = classInfos[1].querySelector('a').textContent;

          const rawClassTimeList = classInfos[4].innerHTML.split('<br>');
          const rawClassLocationList = classInfos[5].innerHTML.split('<br>');

          const dayStringMap = {
            senin: 0,
            selasa: 1,
            rabu: 2,
            kamis: 3,
            jumat: 4,
          };
          
          const classSchedules = rawClassTimeList.map((rawClassTime, rawClassTimeIdx) => {
            const [dayString, startEnd] = rawClassTime.split(', ');
            const day = dayStringMap[dayString.toLowerCase()];
            const [startTime, endTime] = startEnd.split('-');

            const [startHh, startMm] = startTime.split('.');
            const [endHh, endMm] = endTime.split('.');

            const hourDuration = Number(endHh) - Number(startHh);
            const minuteDuration = Number(endMm) - Number(startMm);

            const duration = (hourDuration * 60) + minuteDuration;

            return {
              day,
              startTime: startTime.replace('.', ':'),
              endTime: endTime.replace('.', ':'),
              duration,
              location: rawClassLocationList[rawClassTimeIdx],
            };
          });

          const classLecturer = classInfos[6].innerHTML.replace('<br>', ', ');

          return {
            className,
            classLecturer,
            classSchedules,
          };
        });
    });

    const courses = remapToCourseWithClass(results);

    await browser.close();

    return {
      semester,
      courses,
    };
  } catch (error) {
    return ({ error });
  }
}

function remapToCourseWithClass(results) {
  return results.reduce(
    (res, cur) => {
      if (cur.courseId) {
        return [
          ...res,
          {
            ...cur,
            courseClasses: [],
          },
        ];
      }

      const targetCourse = res[res.length - 1];
      const nextCourse = {
        ...targetCourse,
        courseClasses: [
          ...targetCourse.courseClasses,
          cur,
        ],
      };

      return [
        ...res.slice(0, res.length - 1),
        nextCourse,
      ];
    },
    []
  );
}
