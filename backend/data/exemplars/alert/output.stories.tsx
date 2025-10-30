import type { Meta, StoryObj } from '@storybook/react';
import { Alert, AlertTitle, AlertDescription } from './Alert';
import { useState } from 'react';

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Info: Story = {
  args: {
    variant: 'info',
    title: 'Information',
    children: 'This is an informational message to keep you updated.',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Success',
    children: 'Your changes have been saved successfully.',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Warning',
    children: 'This action may have unintended consequences. Please review before proceeding.',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    title: 'Error',
    children: 'An error occurred while processing your request. Please try again.',
  },
};

export const WithoutTitle: Story = {
  args: {
    variant: 'info',
    children: 'This is an alert without a title.',
  },
};

export const WithComposition: Story = {
  render: () => (
    <Alert variant="success">
      <AlertTitle>Account Created</AlertTitle>
      <AlertDescription>
        Your account has been created successfully. You can now access all features.
      </AlertDescription>
    </Alert>
  ),
};

export const Dismissible: Story = {
  render: () => {
    const [visible, setVisible] = useState(true);

    if (!visible) {
      return (
        <button
          onClick={() => setVisible(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Show Alert
        </button>
      );
    }

    return (
      <Alert
        variant="info"
        title="Update Available"
        onClose={() => setVisible(false)}
      >
        A new version is available. Click here to update.
      </Alert>
    );
  },
};

export const CustomIcon: Story = {
  args: {
    variant: 'info',
    title: 'Custom Icon',
    children: 'This alert uses a custom icon instead of the default.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
};

export const LongContent: Story = {
  args: {
    variant: 'warning',
    title: 'Terms and Conditions Update',
    children: (
      <div className="space-y-2">
        <p>
          We've updated our terms and conditions. Please review the changes carefully
          before continuing to use our service.
        </p>
        <p>
          The main changes include new privacy policies, updated data handling procedures,
          and revised user responsibilities.
        </p>
        <p>
          By continuing to use our service, you agree to these updated terms.
        </p>
      </div>
    ),
  },
};

export const MultipleAlerts: Story = {
  render: () => (
    <div className="space-y-4 w-96">
      <Alert variant="error" title="Critical Error">
        Server connection failed. Please check your internet connection.
      </Alert>
      <Alert variant="warning" title="Warning">
        Your session will expire in 5 minutes.
      </Alert>
      <Alert variant="success" title="Success">
        File uploaded successfully.
      </Alert>
      <Alert variant="info" title="Note">
        New features are now available in the settings panel.
      </Alert>
    </div>
  ),
};

export const DismissibleGroup: Story = {
  render: () => {
    const [alerts, setAlerts] = useState([
      { id: 1, variant: 'info' as const, message: 'System maintenance scheduled for tonight' },
      { id: 2, variant: 'warning' as const, message: 'Password will expire in 7 days' },
      { id: 3, variant: 'success' as const, message: 'Backup completed successfully' },
    ]);

    const dismissAlert = (id: number) => {
      setAlerts(alerts.filter((alert) => alert.id !== id));
    };

    return (
      <div className="space-y-3 w-96">
        {alerts.map((alert) => (
          <Alert
            key={alert.id}
            variant={alert.variant}
            onClose={() => dismissAlert(alert.id)}
          >
            {alert.message}
          </Alert>
        ))}
        {alerts.length === 0 && (
          <p className="text-sm text-gray-500">All alerts dismissed</p>
        )}
      </div>
    );
  },
};
