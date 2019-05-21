import { hello } from '../controllers/jadwalScrapperControllers';

export default function jadwalScrapperRoutes(app) {
  app.route('/scrapper/hello').get(hello);
}
