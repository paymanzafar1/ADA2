import { Component, OnInit, inject } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { AuthUser, PluginService } from '@app/core'
import { HorizontalMenuComponent, HorizontalMenuEntry } from '@app/shared/shared-main/menu/horizontal-menu.component'

@Component({
  selector: 'my-account',
  templateUrl: './my-account.component.html',
  imports: [ HorizontalMenuComponent, RouterOutlet ]
})
export class MyAccountComponent implements OnInit {
  private pluginService = inject(PluginService)

  menuEntries: HorizontalMenuEntry[] = []
  user: AuthUser

  ngOnInit (): void {
    this.pluginService.ensurePluginsAreLoaded('my-account')
      .then(() => this.buildMenu())
  }

  private buildMenu () {
    const clientRoutes = this.pluginService.getAllRegisteredClientRoutesForParent('/my-account') || {}

    this.menuEntries = [
      {
        label: $localize`Settings`,
        routerLink: '/my-account/settings'
      },

      ...Object.values(clientRoutes)
        .map(clientRoute => ({
          label: clientRoute.menuItem?.label,
          routerLink: '/my-account/p/' + clientRoute.route
        }))
    ]
  }
}
