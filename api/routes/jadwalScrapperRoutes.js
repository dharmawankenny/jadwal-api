import { hello, scrapIlkom, scrapSI } from '../controllers/jadwalScrapperControllers';

export default function jadwalScrapperRoutes(app) {
  app.route('/scrapper/hello').get(hello);
  app.route('/scrapper/ilkom').get(scrapIlkom);
  app.route('/scrapper/si').get(scrapSI);
};
