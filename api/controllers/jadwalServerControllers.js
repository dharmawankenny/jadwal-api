import Jadwal from '../models/jadwalModels';

export function hello(_, res) {
  res.send({ hello: 'world' });
}

export function getAllJadwal(_, res) {
  Jadwal.find({}, (error, jadwals) => {
    if (error) {
      res.send({ error, message: 'Failed to get all jadwal' });
    } else {
      res.send(jadwals);
    }
  });
}
