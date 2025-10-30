import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['outlined', 'elevated', 'filled'],
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    padding: 'md',
    children: (
      <>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description goes here</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is the card content area where main information is displayed.</p>
        </CardContent>
      </>
    ),
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    padding: 'md',
    children: (
      <>
        <CardHeader>
          <CardTitle>Elevated Card</CardTitle>
          <CardDescription>Card with shadow elevation</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This card uses shadow to create depth and hierarchy.</p>
        </CardContent>
      </>
    ),
  },
};

export const Filled: Story = {
  args: {
    variant: 'filled',
    padding: 'md',
    children: (
      <>
        <CardHeader>
          <CardTitle>Filled Card</CardTitle>
          <CardDescription>Card with filled background</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This card has a filled background color for subtle distinction.</p>
        </CardContent>
      </>
    ),
  },
};

export const WithFooter: Story = {
  args: {
    variant: 'outlined',
    padding: 'md',
    children: (
      <>
        <CardHeader>
          <CardTitle>Card with Footer</CardTitle>
          <CardDescription>Complete card structure</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This card demonstrates all composition parts including a footer.</p>
        </CardContent>
        <CardFooter>
          <button className="px-4 py-2 bg-blue-500 text-white rounded">Action</button>
        </CardFooter>
      </>
    ),
  },
};

export const NoPadding: Story = {
  args: {
    variant: 'outlined',
    padding: 'none',
    children: (
      <div className="p-4">
        <h3 className="font-semibold mb-2">Custom Padding</h3>
        <p>This card has no default padding, allowing custom spacing.</p>
      </div>
    ),
  },
};

export const SmallPadding: Story = {
  args: {
    variant: 'outlined',
    padding: 'sm',
    children: (
      <>
        <CardTitle>Compact Card</CardTitle>
        <CardDescription>Small padding for dense layouts</CardDescription>
      </>
    ),
  },
};

export const LargePadding: Story = {
  args: {
    variant: 'outlined',
    padding: 'lg',
    children: (
      <>
        <CardTitle>Spacious Card</CardTitle>
        <CardDescription>Large padding for breathing room</CardDescription>
      </>
    ),
  },
};
