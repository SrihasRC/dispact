import type { IConnector } from './interface.js'

class ConnectorRegistry {
  private readonly connectors = new Map<string, IConnector>()

  register (connector: IConnector): void {
    this.connectors.set(connector.name, connector)
  }

  get (name: string): IConnector | undefined {
    return this.connectors.get(name)
  }

  getAll (): IConnector[] {
    return [...this.connectors.values()]
  }
}

// Export the singleton instance, NOT the class
export const registry = new ConnectorRegistry()
