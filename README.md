
#Description de l'API REST
Chaque réponse de l'API est propre au type de requête et s'efforce de suivre au mieux le "pattern" REST. Si le serveur rencontre une erreur lors du traitement de votre requête, vous recevrez une réponse du type : HTTP/1.1 500 Internal Server Error. 

##Install

$ cd api-master

$ npm i -S

$ node ./bin/www

http://localhost:3000

##Clasification de la liste des stations d'une ville 
###Requête :
GET http://localhost:3000/api/list?city= {nom de ville}&orderby= {name ou address}
###Réponse:
Liste des stations en json

##Chercher une station par nom ou par addresse 
###Requête :
GET http://localhost:3000/api/search?city= {nom de ville}&keyWord= {name ou address}
###Réponse:
Une station plus les velos disponibles et total des velos en json

##Clasification par distance 
###Requête :
GET http://localhost:3000/api/geo?city= {nom de ville}&location= {lat,lng}
###Réponse:
Liste des stations plus la distance et coordonées en json


##Pour afficher le JSON vous devez "decommenter" res.json(...) et "commenter" res.render(...) 

