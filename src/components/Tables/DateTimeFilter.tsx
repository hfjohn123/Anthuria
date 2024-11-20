import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { Button } from 'primereact/button';

export default function DateTimeFilter() {
  return (
    <Menu>
      <MenuButton>PlaceHolder</MenuButton>
      <MenuItems transition anchor="bottom end">
        <MenuItem>
          <div>
            <Button>Today</Button>
          </div>
        </MenuItem>
      </MenuItems>
    </Menu>
  );
}
