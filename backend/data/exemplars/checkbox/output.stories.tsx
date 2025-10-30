import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox, CheckboxGroup } from './Checkbox';
import { useState } from 'react';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    indeterminate: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: {
    label: 'Accept terms and conditions',
  },
};

export const Checked: Story = {
  args: {
    label: 'Newsletter subscription',
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'This option is disabled',
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    label: 'This option is disabled and checked',
    checked: true,
    disabled: true,
  },
};

export const Indeterminate: Story = {
  args: {
    label: 'Select all',
    indeterminate: true,
  },
};

export const NoLabel: Story = {
  args: {
    'aria-label': 'Select item',
  },
};

export const Controlled: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <div className="space-y-4">
        <Checkbox
          label="Toggle me"
          checked={checked}
          onCheckedChange={setChecked}
        />
        <p className="text-sm text-gray-600">
          Current state: {checked ? 'Checked' : 'Unchecked'}
        </p>
      </div>
    );
  },
};

export const Group: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>(['notifications']);
    return (
      <CheckboxGroup
        label="Email preferences"
        options={[
          { value: 'notifications', label: 'Receive notifications' },
          { value: 'newsletter', label: 'Subscribe to newsletter' },
          { value: 'updates', label: 'Product updates' },
          { value: 'marketing', label: 'Marketing emails', disabled: true },
        ]}
        value={selected}
        onChange={setSelected}
      />
    );
  },
};

export const SelectAll: Story = {
  render: () => {
    const allOptions = ['option1', 'option2', 'option3'];
    const [selected, setSelected] = useState<string[]>(['option1']);

    const allChecked = selected.length === allOptions.length;
    const someChecked = selected.length > 0 && selected.length < allOptions.length;

    const handleSelectAll = (checked: boolean) => {
      setSelected(checked ? allOptions : []);
    };

    const handleOptionChange = (value: string, checked: boolean) => {
      setSelected(
        checked
          ? [...selected, value]
          : selected.filter((v) => v !== value)
      );
    };

    return (
      <div className="space-y-3">
        <Checkbox
          label="Select all"
          checked={allChecked}
          indeterminate={someChecked}
          onCheckedChange={handleSelectAll}
        />
        <div className="ml-6 space-y-2">
          <Checkbox
            label="Option 1"
            checked={selected.includes('option1')}
            onCheckedChange={(checked) => handleOptionChange('option1', checked)}
          />
          <Checkbox
            label="Option 2"
            checked={selected.includes('option2')}
            onCheckedChange={(checked) => handleOptionChange('option2', checked)}
          />
          <Checkbox
            label="Option 3"
            checked={selected.includes('option3')}
            onCheckedChange={(checked) => handleOptionChange('option3', checked)}
          />
        </div>
      </div>
    );
  },
};
