// Dev. Підставляється замість environment.ts при `ng serve` (configuration=development).
// '/api' іде через proxy.conf.json на https://localhost:7050, щоб cookie лишались same-origin.
export const environment = {
  production: false,
  apiUrl: '/api',
};
