// Dev. Підставляється замість environment.ts при `ng serve` (configuration=development).
// '/api' іде через proxy.conf.json на https://localhost:7050, щоб cookie лишались same-origin.
export const environment = {
  production: false,
  apiUrl: '/api',
  googleClientId: '915356811884-q2updj3s6v376tct8u50jkcsj2r42kn2.apps.googleusercontent.com',
};
