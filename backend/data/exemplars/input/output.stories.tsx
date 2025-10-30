import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
    },
    disabled: {
      control: 'boolean',
    },
    required: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    label: 'Email',
    type: 'email',
    placeholder: 'Enter your email',
  },
};

export const WithHint: Story = {
  args: {
    label: 'Username',
    type: 'text',
    placeholder: 'Choose a username',
    hint: 'Must be at least 3 characters long',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    type: 'email',
    placeholder: 'Enter your email',
    error: 'Please enter a valid email address',
    defaultValue: 'invalid-email',
  },
};

export const Required: Story = {
  args: {
    label: 'Full Name',
    type: 'text',
    placeholder: 'John Doe',
    required: true,
    hint: 'This field is required',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Account ID',
    type: 'text',
    defaultValue: 'ACC-12345',
    disabled: true,
    hint: 'This field cannot be modified',
  },
};

export const Password: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password',
    hint: 'Minimum 8 characters',
  },
};

export const Number: Story = {
  args: {
    label: 'Age',
    type: 'number',
    placeholder: '18',
    min: 0,
    max: 120,
  },
};

export const Telephone: Story = {
  args: {
    label: 'Phone Number',
    type: 'tel',
    placeholder: '+1 (555) 000-0000',
    hint: 'Include country code',
  },
};

export const NoLabel: Story = {
  args: {
    type: 'text',
    placeholder: 'Search...',
    'aria-label': 'Search',
  },
};
