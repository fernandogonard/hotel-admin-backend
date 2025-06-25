import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
const specs = swaggerJsDoc({
  swaggerDefinition: { openapi: '3.0.0', info: { title: 'Hotel API', version: '1.0.0' } },
  apis: ['./routes/*.js'],
});
export default (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};
