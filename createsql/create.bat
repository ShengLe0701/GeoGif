
echo 'password=z21pP7YFO6OA'

mysql -uroot -pz21pP7YFO6OA < createdb.sql

echo 'cd /D C:\Bitnami\wampstack-5.6.24-0\frameworks\laravel'
php C:\Bitnami\wampstack-5.6.24-0\frameworks\laravel\artisan migrate:rollback
php C:\Bitnami\wampstack-5.6.24-0\frameworks\laravel\artisan migrate

#mysql -uroot -pz21pP7YFO6OA < createuser.sql


