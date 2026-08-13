FROM nginx:alpine-slim

LABEL maintainer="DevBrain Team"
LABEL description="Guía 05 web - Teoría General de Sistemas, arquitectura de software e IA"

# Reemplazar la configuración predeterminada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar el contenido estático de la aplicación
COPY index.html /usr/share/nginx/html/index.html
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/
COPY guide.manifest.json /usr/share/nginx/html/guide.manifest.json
COPY WEB-DESIGN-BRIEF.md /usr/share/nginx/html/WEB-DESIGN-BRIEF.md
COPY README.md /usr/share/nginx/html/README.md

# Puerto expuesto por Nginx
EXPOSE 80

# Chequeo de salud nativo con wget (incluido en Alpine)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
