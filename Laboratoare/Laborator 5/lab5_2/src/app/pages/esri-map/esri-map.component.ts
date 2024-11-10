import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  OnDestroy
} from "@angular/core";

import esri = __esri; // Esri TypeScript Types

import Config from '@arcgis/core/config';
import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';
import Bookmarks from '@arcgis/core/widgets/Bookmarks';
import Expand from '@arcgis/core/widgets/Expand';
import * as locator from "@arcgis/core/rest/locator"
import * as ReactiveUtils from "@arcgis/core/core/reactiveUtils";

import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import Polygon from '@arcgis/core/geometry/Polygon';
import Polyline from '@arcgis/core/geometry/Polyline';

import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

import FeatureSet from '@arcgis/core/rest/support/FeatureSet';
import RouteParameters from '@arcgis/core/rest/support/RouteParameters';
import * as route from "@arcgis/core/rest/route.js";

import { FirebaseService, IDatabaseItem} from "src/app/services/firebase";

@Component({
  selector: "app-esri-map",
  templateUrl: "./esri-map.component.html",
  styleUrls: ["./esri-map.component.scss"]
})
export class EsriMapComponent implements OnInit, OnDestroy {

  @Output() mapLoadedEvent = new EventEmitter<boolean>();

  @ViewChild("mapViewNode", { static: true }) private mapViewEl: ElementRef;

  map: esri.Map;
  view: esri.MapView;
  locator: esri.locator;
  graphicsLayer: esri.GraphicsLayer;
  graphicsLayerUserPoints: esri.GraphicsLayer;
  graphicsLayerRoutes: esri.GraphicsLayer;
  trailheadsLayer: esri.FeatureLayer;
  listItems: IDatabaseItem[] = [];

  zoom = 10;
  center: Array<number> = [-118.73682450024377, 34.07817583063242];
  basemap = "streets-vector";
  loaded = false;
  directionsElement: any;

  constructor(private fbs: FirebaseService) { }

  ngOnInit() {
    this.initializeMap().then(() => {
      this.loaded = this.view.ready;
      this.mapLoadedEvent.emit(true);
    });
    this.fbs.connectToDatabase();
  }

  async initializeMap() {
    try {
      Config.apiKey = "AAPTxy8BH1VEsoebNVZXo8HurMCp4qgW4-ZIRhIDK70_g6v-Uw7dByY40YarduiX8ccxJX2U1YnCWkF64fggxJ6YsAq54RspWYBFnBNkVJQrREBWgkrZajv89mYEL_eLqi6rv7aU7bCMPjb1xsHVShNohRz5kXlpIcTei1lSohZqiE6thIRbPK-bCgb84E-Wu3iuvUMtNWE7Z_Vx2l7SIzbKqBtpWW7Y7abwdbQlcLgOn6c.AT1_SmpnXQfP";

      const mapProperties: esri.WebMapProperties = {
        basemap: this.basemap
      };
      this.map = new WebMap(mapProperties);

      this.addFeatureLayers();
      this.addGraphicsLayer();

      const mapViewProperties = {
        container: this.mapViewEl.nativeElement,
        center: this.center,
        zoom: this.zoom,
        map: this.map
      };
      this.view = new MapView(mapViewProperties);

      this.view.on('pointer-move', ["Shift"], (event) => {
        const point = this.view.toMap({ x: event.x, y: event.y });
        console.log("Map pointer moved: ", point.longitude, point.latitude);
      });

      await this.view.when();

      console.log("ArcGIS map loaded");
      this.addRouting();

      this.addPlaceSearch();
      return this.view;
    } catch (error) {
      console.error("Error loading the map: ", error);
      alert("Error loading the map");
    }
  }

  addFeatureLayers() {
    this.trailheadsLayer = new FeatureLayer({
      url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trailheads/FeatureServer/0",
      outFields: ['*']
    });
    this.map.add(this.trailheadsLayer);

    const trailsLayer = new FeatureLayer({
      url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trails/FeatureServer/0"
    });
    this.map.add(trailsLayer, 0);

    const parksLayer = new FeatureLayer({
      url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Parks_and_Open_Space/FeatureServer/0"
    });
    this.map.add(parksLayer, 0);

    console.log("Feature layers added");
  }

  addGraphicsLayer() {
    this.graphicsLayer = new GraphicsLayer();
    this.addPolygon();
    this.addPolyline();
    this.map.add(this.graphicsLayer);
    this.graphicsLayerUserPoints = new GraphicsLayer();
    this.map.add(this.graphicsLayerUserPoints);
    this.graphicsLayerRoutes = new GraphicsLayer();
    this.map.add(this.graphicsLayerRoutes);
  }

  addRouting() {
    const routeUrl = "https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World";
    
    this.view.on("click", (event) => {
      this.view.hitTest(event).then((elem: esri.HitTestResult) => {
        if (elem && elem.results && elem.results.length > 0) {
          let point: esri.Point = elem.results.find(e => e.layer === this.trailheadsLayer)?.mapPoint;
          
          if (point) {
            console.log("get selected point: ", elem, point);
            
            if (this.graphicsLayerUserPoints.graphics.length === 0) {
              this.addPoint(point.latitude, point.longitude);
            } else if (this.graphicsLayerUserPoints.graphics.length === 1) {
              this.addPoint(point.latitude, point.longitude);
              this.addPointAndSaveToFirebase(point.latitude, point.longitude);
              this.calculateRoute(routeUrl);
            } else {
              this.removePoints();
            }
          }
  
          // Fetch data from Firebase and add points to map
          this.fbs.getChangeFeedList().subscribe(
            (items: IDatabaseItem[]) => {
              this.listItems = items; // Store data in local array
              
              // Iterate over list items and log each item in the console
              this.listItems.forEach(item => {
                const data = JSON.parse(item.val);
  
                // Extract latitude and longitude values
                const lat = data.latitude;
                const lng = data.longitude;
  
                this.addPoint(lat, lng);
              });
            },
            error => {
              console.error("Error retrieving data from Firebase:", error);
            }
          );
        }
      });
    });
  }
  
  addPoint(lat: number, lng: number) {
    let point = new Point({
      longitude: lng,
      latitude: lat
    });

    const simpleMarkerSymbol = {
      type: "simple-marker",
      color: [226, 119, 40],  // Orange
      outline: {
        color: [255, 255, 255], // White
        width: 1
      }
    };

    let pointGraphic: esri.Graphic = new Graphic({
      geometry: point,
      symbol: simpleMarkerSymbol
    });

    this.graphicsLayerUserPoints.add(pointGraphic);
  }

  // Lab 4: Adaugare polyline
  addPolyline() {
    const polyline = new Polyline({
      paths: [
        [
        [-118.821527826096, 34.0139576938577], //Longitude, latitude
        [-118.814893761649, 34.0080602407843], //Longitude, latitude
        [-118.808878330345, 34.0016642996246], //Longitude, latitude
      ]
    ],
    });

    const simpleLineSymbol = {
      type: "simple-line",
      color: [226, 119, 40], // Orange
      width: 2,
    };

    const polylineGraphic = new Graphic({
      geometry: polyline,
      symbol: simpleLineSymbol,
    });
    this.graphicsLayer.add(polylineGraphic);
  }

  // LAB 4: Adaugare polygon:
  addPolygon() {
    const polygon = new Polygon({
      rings: [
        [
          [-118.818984489994, 34.0137559967283], //Longitude, latitude
          [-118.806796597377, 34.0215816298725], //Longitude, latitude
          [-118.791432890735, 34.0163883241613], //Longitude, latitude
          [-118.79596686535, 34.008564864635], //Longitude, latitude
          [-118.808558110679, 34.0035027131376], //Longitude, latitude
      ]
    ],
    });

    const simpleFillSymbol = {
      type: "simple-fill",
      color: [227, 139, 79, 0.8], // Orange, opacity 80%
      outline: {
        color: [255, 255, 255],
        width: 1,
      },
    };

    const popupTemplate = {
      title: "{Name}",
      content: "{Description}",
    };
    const attributes = {
      Name: "Graphic",
      Description: "I am a polygon",
    };

    const polygonGraphic = new Graphic({
      geometry: polygon,
      symbol: simpleFillSymbol,
      attributes: attributes,
      popupTemplate: popupTemplate,
    });

    this.graphicsLayer.add(polygonGraphic);
  }

  // Lab 4: Adaugare Place Search
  addPlaceSearch() {
    const places = ["Choose a place type...", "Parks and Outdoors", "Coffee shop", "Gas station", "Food", "Hotel"];
    const select = document.createElement("select");
    select.setAttribute("class", "esri-widget esri-select");
    select.setAttribute("style", "width: 175px; font-family: 'Avenir Next W00'; font-size: 1em");
    
    // Populate the dropdown with place types
    places.forEach((place) => {
      const option = document.createElement("option");
      option.value = place;
      option.innerHTML = place;
      select.appendChild(option);
    });
  
    // Add the dropdown to the map view's UI
    this.view.ui.add(select, "top-right");
  
    const locatorUrl = "https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer";
  
    // Place search function with correct scope
    const findPlaces = (category: string, pt: esri.Point) => {
      locator.addressToLocations(locatorUrl, {
        address: "",
        location: pt,
        categories: [category],
        maxLocations: 25,
        outFields: ["Place_addr", "PlaceName"]
      }).then((results: esri.AddressCandidate[]) => {
        this.view.closePopup();
        this.view.graphics.removeAll();
  
        const resultSymbol = {
          type: "simple-marker",
          color: "#000000",
          size: "12px",
          outline: {
            color: "#ffffff",
            width: 2
          }
        };
        // Add graphics for each result
        results.forEach((result) => {
          this.view.graphics.add(
            new Graphic({
              attributes: result.attributes, // Data attributes returned
              geometry: result.location, // Point returned
              symbol: resultSymbol,
              popupTemplate: {
                title: "{PlaceName}", // Data attribute names
                content: "{Place_addr}"
              }
            })
          );
        });
      }).catch((error) => {
        console.error("Error in finding places: ", error);
      });
    };
  
    // ReactiveUtils.when to find places when view is stationary
    ReactiveUtils.when(
      () => this.view.stationary,
      () => {
        const category = (select.value !== "Choose a place type...") ? select.value : null;
        if (category) {
          findPlaces(category, this.view.center);
        }
      }
    );
  
    // Listen for category changes and find places
    select.addEventListener("change", (event) => {
      const category = (event.target as HTMLSelectElement).value;
      if (category !== "Choose a place type...") {
        findPlaces(category, this.view.center);
      }
    });
  }
  
  addPointAndSaveToFirebase(lat: number, lng: number) {
    let point = new Point({
      longitude: lng,
      latitude: lat
    });

    const simpleMarkerSymbol = {
      type: "simple-marker",
      color: [226, 119, 40],  // Orange
      outline: {
        color: [255, 255, 255], // White
        width: 1
      }};
      this.savePointToFirebase(lat, lng);
    };

    savePointToFirebase(lat: number, lng: number) {
      const pointData = { latitude: lat, longitude: lng, timestamp: new Date() };
      const pointDataStr = JSON.stringify(pointData);
      this.fbs.addListObject(pointDataStr);
    }

  removePoints() {
    this.graphicsLayerUserPoints.removeAll();
  }

  removeRoutes() {
    this.graphicsLayerRoutes.removeAll();
  }

  async calculateRoute(routeUrl: string) {
    const routeParams = new RouteParameters({
      stops: new FeatureSet({
        features: this.graphicsLayerUserPoints.graphics.toArray()
      }),
      returnDirections: true
    });

    try {
      const data = await route.solve(routeUrl, routeParams);
      this.displayRoute(data);
    } catch (error) {
      console.error("Error calculating route: ", error);
      alert("Error calculating route");
    }
  }

  displayRoute(data: any) {
    for (const result of data.routeResults) {
      result.route.symbol = {
        type: "simple-line",
        color: [5, 150, 255],
        width: 3
      };
      this.graphicsLayerRoutes.graphics.add(result.route);
    }
    if (data.routeResults.length > 0) {
      this.showDirections(data.routeResults[0].directions.features);
    } else {
      alert("No directions found");
    }
  }

  clearRouter() {
    if (this.view) {
      // Remove all graphics related to routes
      this.removeRoutes();
      this.removePoints();
      console.log("Route cleared");
      this.view.ui.remove(this.directionsElement);
      this.view.ui.empty("top-right");
      console.log("Directions cleared");
    }
  }

  showDirections(features: any[]) {
    this.directionsElement = document.createElement("ol");
    this.directionsElement.classList.add("esri-widget", "esri-widget--panel", "esri-directions__scroller");
    this.directionsElement.style.marginTop = "0";
    this.directionsElement.style.padding = "15px 15px 15px 30px";

    features.forEach((result, i) => {
      const direction = document.createElement("li");
      direction.innerHTML = `${result.attributes.text} (${result.attributes.length} miles)`;
      this.directionsElement.appendChild(direction);
    });

    this.view.ui.empty("top-right");
    this.view.ui.add(this.directionsElement, "top-right");
  }

  ngOnDestroy() {
    if (this.view) {
      this.view.container = null;
    }
  }
}
