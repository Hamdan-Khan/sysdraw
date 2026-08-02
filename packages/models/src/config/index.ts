const REGISTRY_CONFIG_KEY = "zero-sketch-registry-config";

interface RegistryConfig {
  /** id of selected library */
  selectedLib: string;
}

export { REGISTRY_CONFIG_KEY, type RegistryConfig };
