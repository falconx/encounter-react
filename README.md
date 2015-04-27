# Deploy
1. ```npm install```
2. Create a ```server/config/providers.json```
3. ```npm start```

# Todo
- Sourcemaps
- Tests

Phase 1:
1. [ ] Have Presence.findWithinRadius return data with N meters of location.
2. [ ] Watch users location and specify threashold of accuracy.
3. [ ] Update users position on the map.
4. [ ] Show new presences when they come into range (use dev tools to change location).
5. [ ] Get map to show all presences within radius which don't belong to the user.
6. [x] Draw circle search radius on map for dev mode/testing.

Phase 2:
1. [ ] If possible, show circular profile image at center of map. Otherwise show firefly image.
2. [ ] On clicking the image/current position, show a menu: Drop presence, ...



Map spec:
- Show presences within N meters of user location.
- Update state.nearbyPresences on socket presence:dropped and user location change.

- https://github.com/pieterv/react-googlemaps
- Create <Marker> Component? or forceUpdate?