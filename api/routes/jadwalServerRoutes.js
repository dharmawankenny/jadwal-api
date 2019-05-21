import { hello, getAllJadwal } from '../controllers/jadwalServerControllers';

export default function jadwalServerRoutes(app) {
  app.route('/api/hello').get(hello);
  app.route('/api/jadwal').get(getAllJadwal);
}
