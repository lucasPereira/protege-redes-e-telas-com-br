#!/bin/bash

git pull origin main
sudo cp -R * /var/www/protegeredesetelas.com.br
sudo chown -R www-data:www-data /var/www/protegeredesetelas.com.br
