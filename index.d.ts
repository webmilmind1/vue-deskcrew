export interface DeskcrewOptions {
  /** Your DeskCrew public widget key, e.g. "pub_xxxxxxxx". Required. */
  widgetKey: string
  /** Board slug (lowercase letters, numbers and dashes). Optional. */
  board?: string
  /** Accent colour as a 6-digit hex value, e.g. "#4f46e5". Optional. */
  color?: string
  /** Which side the launcher sits on. Optional (defaults to the widget's own default). */
  position?: 'left' | 'right'
  /** Greeting shown on the launcher. Optional. */
  greeting?: string
}
import type { App, DefineComponent } from 'vue'

/** Injects the widget <script> into the document once. Returns false when the key is invalid or on the server. */
export function injectDeskcrew(options: DeskcrewOptions): boolean
/** Vue plugin: app.use(deskcrew, { widgetKey: 'pub_...' }). */
export const deskcrew: { install(app: App, options: DeskcrewOptions): void }
/** Component that injects the widget on mount and renders nothing. */
export const DeskCrewWidget: DefineComponent<DeskcrewOptions>
export default deskcrew
export function buildTag(options: DeskcrewOptions): { tag: string | null; warnings: string[] }
