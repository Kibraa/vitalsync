# Image Nginx officielle legere pour servir le frontend
FROM nginx:alpine
# Copier la configuration Nginx personnalisee
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copier les fichiers statiques du frontend
COPY index.html /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
