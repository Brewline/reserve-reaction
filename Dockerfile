##############################################################################
# meteor-dev stage - builds image for dev and used with docker-compose.yml
##############################################################################
FROM reactioncommerce/base:v1.7.0.3-meteor as meteor-dev

LABEL maintainer="Reaction Commerce <architecture@reactioncommerce.com>"

ENV PATH $PATH:/home/node/.meteor

COPY --chown=node package-lock.json $APP_SOURCE_DIR/
COPY --chown=node package.json $APP_SOURCE_DIR/

# Because Docker Compose uses a named volume for node_modules and named volumes are owned
# by root by default, we have to initially create node_modules here with correct owner.
# Without this NPM cannot write packages into node_modules later, when running in a container.
RUN mkdir "$APP_SOURCE_DIR/node_modules" && chown node "$APP_SOURCE_DIR/node_modules"

# Due to an async race condition issue when installing packages with the NPM version (v5.10.0)
# in Meteor 1.7, we are switching to using the NPM version installed in the base image (v5.6.0).
# This prevents the "write after end" errors seen with this command. This will be reverted when
# Meteor updates to an NPM version without this issue.
RUN npm install

COPY --chown=node . $APP_SOURCE_DIR


##############################################################################
# builder stage - builds the production bundle
##############################################################################
FROM meteor-dev as builder

RUN printf "\\n[-] Running Reaction plugin loader...\\n" \
 && reaction plugins load
RUN printf "\\n[-] Building Meteor application...\\n" \
 && meteor build --server-only --architecture os.linux.x86_64 --directory "$APP_BUNDLE_DIR"

WORKDIR $APP_BUNDLE_DIR/bundle/programs/server/

# TODO: Revert to Meteor NPM. See comment above about Meteor1.7 NPM version issue
RUN npm install --production


##############################################################################
# final build stage - create the final production image
##############################################################################
FROM node:8.11.3-slim

# Default environment variables
ENV ROOT_URL "http://localhost"
ENV PORT 3000

# grab the dependencies and built app from the previous builder image
COPY --chown=node --from=builder /opt/reaction/dist/bundle /app

WORKDIR /app

EXPOSE 3000

CMD ["node", "main.js"]
