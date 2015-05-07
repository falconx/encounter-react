# Deploy
1. ```npm install```
2. Create a ```server/config/providers.json```
3. ```npm start```

# Todo
- Refactor map-encounter.jsx

- Sourcemaps
- Tests
- Bundle vendor files separately
- Dev mode switch
- Stylesheet/Radium

# Questions
- Visually disable pickup menu item when not near another presence.

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

Phase 3:
1. [ ] Only update the map once the user has moved N distance since the last check.
2. [ ] Allow pickup of nearby presence.
3. [ ] Don't allow clicking on map landmarks.
4. [ ] Don't allow map zoom level to change.
5. [ ] Confirmation screen when releasing presence.
6. [ ] Remove presence data in real-time once they have been removed.

Phase 4:
1. [ ] Dropped presences screen.

Phase 5:
1. [ ] Show faces of found users on presence map.
2. [ ] Hide all other presences that belong to a user after finding one that belongs to them.

Phase 6:
1. [ ] Create found presences page and list found presences.
2. [ ] Link found presences menu item from map to page.
3. [ ] Leave a message when releasing a presence.
4. [ ] Show presence message when on confirmation page before collecting a presence.
5. [ ] Show profile image of presence uid on confirmation page before collecting a presence.

Phase 7:
1. [ ] Only allow 3 presences to be released at any one time, per user.
2. [ ] Expire presences over time.
3. [ ] Visually indicate time remaining on dropped presences screen.
4. [ ] Visually indicate time remaining on found presences screen.
5. [ ] Visually indicate time remaining on question prompt screen (when collecting a presence).

Phase 8:
1. [ ] Show help screen for first time users.
2. [ ] Handle devices which don’t support GeoLocation.
3. [ ] Create launch screen and animate through background images.
4. [ ] Gradient text should have shimmer effect.
5. [ ] Dashboard - Show unread messages stat.
6. [ ] Dashboard - Show active presences stat.
7. [ ] Dashboard - Show unreplied messages stat.
8. [ ] Dashboard - Link stats.

Phase 9:
1. [ ] Allow messaging between users - Limit character count to 140.
2. [ ] Drop presence - Limit character count to 140.
3. [ ] Allow removing specific messages.

Phase 10:
1. [ ] Allow user to override user profile image?
2. [ ] Remove / block user.
3. [ ] Prevent the user from exposing their name until some circumstance(s) - Quiz system.

Phase 11:
1. Quiz system