# Deploy
1. ```npm install```
2. Create a ```server/config/providers.json```
3. ```npm start```

# Todo
- Sourcemaps
- Tests
- Bundle vendor files separately
- Dev mode switch
- Stylesheet/Radium
- initializeTouchEvents(boolean shouldUseTouch)

# Notes & Questions
- Possible solution to avoiding clustering and too many markers in one location is to not allow a release near another.
- FacebookId is revealed in response data - Will be fixed in Phase 4 with encryption and proxy on server.
- nearbyPresence query returns photo - should this be a separate query?

Luke:
 1. [ ] Design favicon.
 2. [ ] Design app icon.
 3. [ ] Visually disable/hide pickup menu item when not near another presence.
 4. [ ] How can we make it more obvious that you are close enough to a presence to pick it up?

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
 5. [x] Dropped presences screen.
 6. [ ] Use socket.io to show presence when dropped nearby.
 7. [ ] map-encounter.jsx: Updating on socket listeners will happen too frequently in the real world.

Phase 3:
 1. [ ] Only update the map once the user has moved N distance since the last check to avoid hammering server.
 2. [x] Allow pickup of a nearby (closest) presence.
 3. [x] Don't allow clicking on poi.
 4. [x] Don't allow map zoom level to change.
 5. [x] Confirmation screen when releasing presence.
 6. [ ] Remove presence data in real-time once they have been removed.
 7. [x] Don't allow map panning.
 8. [ ] Dropped presences screen stats.
 9. [x] Show account photo as presence icon for found presenecs.
 10. [x] Hide all other presences that belong to a user after finding one that belongs to them.
 11. [x] Redraw marker icons after picking up a presence.
 12. [ ] Make menu overlay follow the user position.
 13. [x] Don't allow pickup of already found presences.
 14. [x] Currently we allow the user to pickup a presence that is anywhere within the search radius - we should have a separate radius check to determine if the user is close enough to the presence to pick it up.
 15. [x] Have nearest query return distance away.
 16. [x] Don't allow pickup of presences which belong to a user they have already found.

Phase 4:
 1. [x] Create found presences page and list found presences.
 2. [x] Link found presences menu item from map to page.
 3. [x] Leave a question when releasing a presence.
 4. [x] Show presence question when on confirmation page before collecting a presence.
 5. [x] Show profile image of presence uid on confirmation page before collecting a presence.
 6. [ ] Encrypt facebookId or entire account photo url path on the server via proxy.

Phase 5:
 1. [ ] Only allow 3 presences to be released at any one time, per user.
 2. [ ] Expire presences over time.
 3. [ ] Visually indicate time remaining on dropped presences screen.
 4. [ ] Visually indicate time remaining on found presences screen.
 5. [ ] Visually indicate time remaining on question prompt screen (when collecting a presence).

Phase 6:
 1. [ ] Handle devices which don’t support GeoLocation.
 2. [ ] Create launch screen and animate through background images.
 3. [ ] Gradient text should have shimmer effect.
 4. [ ] Dashboard - Show active presences stat.
 5. [ ] Dashboard - Link stats.

Phase 7:
 1. [ ] Allow messaging between users - Limit character count to 140.
 2. [ ] Drop presence - Limit character count to 140.
 3. [ ] Allow removing specific messages.
 4. [ ] Dashboard - Show unread messages stat.
 5. [ ] Dashboard - Show unreplied messages stat.

Phase 8:
 1. [ ] Allow user to override user profile image?
 2. [ ] Remove / block user.

Phase 9:
 1. [ ] Quiz system.
 2. [ ] Show help screen for first time users.
 3. [ ] Prevent the user from exposing their name until some circumstance(s) - Quiz system.

Phase 10:
 1. [ ] Get a PhoneGap client build working.
 2. [ ] https only server.