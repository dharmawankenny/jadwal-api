import { hello } from '../controllers/jadwalServerControllers';

export default function jadwalServerRoutes(app) {
  app.route('/api/hello').get(hello);
}
