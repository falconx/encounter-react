# Deploy
 1. ```npm install```
 2. Create a ```server/config/providers.json```
 3. ```npm start```

# Cordova commands
```
cd ~/android-studio/bin/
bash studio.sh
```
```cordova platform add android```
```cordova build android```
```cordova emulate android```
```cordova run android```

# Todo
 - Copy index.html file from src to public
 - Copy images directory from src to public
 - Sourcemaps
 - Tests
 - Dev mode switch
 - Stylesheet/Radium/Sass
 - initializeTouchEvents(boolean shouldUseTouch)
 - Upgrade React
 - Upgrade ReactRouter
 - Share config between client and server
 - Handle timezones?
 - Isomorphic rendering
 - Translations

# Folder structure

- dist
-- bundle.js
-- vendors.js
-- index.html
-- images
-- css

- config.js
- src
-- index.html
-- js
--- vendors
-- images
-- sass

# Notes & Questions
- If a presence has expired should it be removed from the database? What impact will this have?
- Possible solution to avoiding clustering and too many markers in one location is to not allow a release near another.
- nearbyPresence query returns photo - should this be a separate query?
- How to handle encountered display when you have a presence to a user who found a presence which you released - currently this would cause two chats.
- See Phase 11.

# Bugs
 1. [ ] Pickup presence. Actual result: Users marker appears below the encountered marker until clicked on. (Note we have 1000 zIndex)
 2. [T] Char count doesn't reset after sending a message.
 3. [ ] Reponding to a message doesn't appear as a encountered user for the creator. Update fn HelperMixins.getEncounteredUsers.

Luke:
 1. [ ] Design favicon.
 2. [ ] Design app icon.
 3. [ ] Visually disable/hide pickup menu item when not near another presence.
 4. [ ] How can we make it more obvious that you are close enough to a presence to pick it up?
 5. [ ] Indicate unread state on messages screen.
 6. [ ] Update Invision screens e.g. Dashboard.

# Sprints
Phase 1:
 1. [x] Have Presence.findWithinRadius return data with N meters of location.
 2. [x] Watch users location and specify threashold of accuracy.
 3. [x] Update users position on the map.
 4. [x] Show new presences when they come into range (use dev tools to change location).
 5. [x] Get map to show all presences within radius which don't belong to the user.
 6. [x] Draw circle search radius on map for dev mode/testing.

Phase 2:
 1. [x] If possible, show circular profile image at center of map. Otherwise show firefly image.
 2. [x] On clicking the image/current position, show a menu: Drop presence, ...
 3. [x] Refactor map-encounter.jsx and presence-map.jsx
 4. [x] Request profile image using Passport instead of using Facebook Graph API.
 5. [x] Released presences screen.
 6. [x] Use socket.io to show presence when dropped nearby.
 7. [x] map-encounter.jsx: Updating on socket listeners will happen too frequently in the real world.

Phase 3:
 1. [x] Only update the map once the user has moved N distance since the last check to avoid hammering server.
 2. [x] Allow pickup of a nearby (closest) presence.
 3. [x] Don't allow clicking on poi.
 4. [x] Don't allow map zoom level to change.
 5. [x] Confirmation screen when releasing presence.
 6. [x] Don't allow map panning.
 7. [x] Released presences screen stats.
 8. [x] Show account photo as presence icon for found presenecs.
 9. [x] Hide all other presences that belong to a user after finding one that belongs to them.
 10. [x] Redraw marker icons after picking up a presence.
 11. [x] Make menu overlay follow the user position.
 12. [x] Don't allow pickup of already found presences.
 13. [x] Currently we allow the user to pickup a presence that is anywhere within the search radius - we should have a separate radius check to determine if the user is close enough to the presence to pick it up.
 14. [x] Have nearest query return distance away.
 15. [x] Don't allow pickup of presences which belong to a user they have already found.
 16. [x] Encountered list should show when people have responded to your own released presences.

Phase 4:
 1. [x] Create found presences page and list found presences.
 2. [x] Link found presences menu item from map to page.
 3. [x] Leave a question when releasing a presence.
 4. [x] Show presence question when on confirmation page before collecting a presence.
 5. [x] Show profile image of presence uid on confirmation page before collecting a presence.
 6. [x] Encrypt facebookId or entire account photo url path on the server via proxy.

Phase 5:
 1. [ ] Only allow 3 presences to be released at any one time, per user.
 2. [T] Expire presences over time.
 3. [ ] Remove presence data in real-time once they have been expired.
 4. [ ] Visually indicate time remaining on dropped presences screen.
 5. [ ] Visually indicate time remaining on found presences screen.
 6. [ ] Visually indicate time remaining on question prompt screen (when collecting a presence).
 7. [x] Visually indicate time remaining on messages screen.

Phase 6:
 1. [ ] Handle devices which don’t support GeoLocation.
 2. [ ] Create launch screen and animate through background images.
 3. [ ] Gradient text should have shimmer effect.
 4. [ ] Dashboard - Show active presences stat.
 5. [ ] Dashboard - Link stats.

Phase 7:
 1. [x] Allow messaging between users
 2. [x] Limit character count to 140.
 3. [ ] Release presence - Limit character count to 140 (component for textarea's with limit counter?)
 4. [ ] Encoounter presence - Limit character count to 140 (component for textarea's with limit counter?)
 5. [ ] Add server-side character count validation.
 6. [ ] Allow removing specific messages.
 7. [ ] Dashboard - Show unread messages stat.
 8. [ ] Dashboard - Show unreplied messages stat.

Phase 8:
 1. [ ] Quiz system.
 2. [ ] Help screen for first time users.
 3. [ ] Prevent the user from exposing their name until some circumstance(s) - Quiz system.

Phase 9:
 1. [ ] Get a PhoneGap client build working.
 2. [ ] https only server.

Phase 10:
 1. [x] Message system via sockets
 2. [ ] Allow user to override user profile image?
 3. [ ] Remove / block user.

Phase 11:
 - Click on presence from my-presences screen to view question and a list of users who have encountered it
 -- Q. What happens if a presence has expired? If we leave it there the screen will be cluttered but if we don't, we lose the functionality.