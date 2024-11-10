import { Component } from '@angular/core';
import { NavigationEnd, Event, Router } from '@angular/router';

interface ITab {
  name: string;
  link: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {

  tabs: ITab[] = [{
    name: 'Home',
    link: '/home'
  }, {
    name: 'Map',
    link: '/map'
  }];

  activeTab = this.tabs[0].link;

  constructor(private router: Router) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.activeTab = event.url;
        console.log(event);
      }
    });
  }

  // See app.component.html
  mapLoadedEvent(status: boolean) {
    console.log('The map loaded: ' + status);
  }
}

