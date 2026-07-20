export interface ContextMenuState {
  x: number;
  y: number;
}

export interface ContextMenuItem {
  label: string;
  shortcut?: string;
  icon?: React.ReactNode;
  action?: () => void;
  /** renders a separator line above this item */
  divider?: boolean;
  disabled?: boolean;
  checked?: boolean;
  submenu?: ContextMenuItem[];
}
