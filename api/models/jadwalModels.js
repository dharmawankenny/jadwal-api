import mongoose from 'mongoose';

const classScheduleSchema = new mongoose.Schema({
  day: { type: Number, min: 0, max: 4 },
  startTime: String,
  endTime: String,
  duration: Number,
  location: String,
});

const courseClassSchema = new mongoose.Schema({
  className: String,
  classLecturer: String,
  classSchedules: [classScheduleSchema],
});

const courseSchema = new mongoose.Schema({
  courseId: String,
  courseName: String,
  courseSKS: String,
  courseTerm: String,
  courseCurriculum: String,
  coursePrerequisite: String,
  courseClasses: [courseClassSchema],
});

const jadwalSchema = new mongoose.Schema({
  majorId: String,
  semester: String,
  courses: [courseSchema],
});

export default mongoose.model('Jadwal', jadwalSchema);
