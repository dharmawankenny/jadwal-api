import { hello, scrapSI } from '../controllers/jadwalScrapperControllers';

export default function jadwalScrapperRoutes(app) {
  app.route('/scrapper/hello').get(hello);
  app.route('/scrapper/si').get(scrapSI);
}
