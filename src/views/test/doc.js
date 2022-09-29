import tt from "@tomtom-international/web-sdk-maps";

var map = tt.map({
  key: "<your maps api key>",
  container: "map",
});

map.jumpTo({ zoom: 5, center: [4.876935, 52.360306] });
