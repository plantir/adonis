/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route');
Route.group(() => {
  Route.get('register2', () => {
    return 'register';
  });
  Route.get('login', 'vrwebdesign-adonis/Auth.login');
}).prefix('auth');
