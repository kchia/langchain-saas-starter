import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "./select";

const meta = {
  title: "UI/Select",
  component: Select,
  parameters: {
    layout: "centered"
  },
  tags: ["autodocs"]
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic select dropdown
export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="blueberry">Blueberry</SelectItem>
        <SelectItem value="grapes">Grapes</SelectItem>
        <SelectItem value="pineapple">Pineapple</SelectItem>
      </SelectContent>
    </Select>
  )
};

// EditModal Category dropdown (from wireframe)
export const CategorySelect: Story = {
  name: "Edit Modal - Category",
  render: () => (
    <div className="w-full max-w-md space-y-2">
      <label className="block text-sm font-medium">Category:</label>
      <Select defaultValue="props">
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="props">Props</SelectItem>
          <SelectItem value="events">Events</SelectItem>
          <SelectItem value="states">States</SelectItem>
          <SelectItem value="accessibility">Accessibility</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
};

// EditModal Type dropdown (from wireframe)
export const TypeSelect: Story = {
  name: "Edit Modal - Type",
  render: () => (
    <div className="w-full max-w-md space-y-2">
      <label className="block text-sm font-medium">Type:</label>
      <Select defaultValue="string">
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="string">string</SelectItem>
          <SelectItem value="boolean">boolean</SelectItem>
          <SelectItem value="number">number</SelectItem>
          <SelectItem value="function">function</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
};

// With grouped options
export const WithGroups: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Select a timezone" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>North America</SelectLabel>
          <SelectItem value="est">Eastern Standard Time (EST)</SelectItem>
          <SelectItem value="cst">Central Standard Time (CST)</SelectItem>
          <SelectItem value="mst">Mountain Standard Time (MST)</SelectItem>
          <SelectItem value="pst">Pacific Standard Time (PST)</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Europe & Africa</SelectLabel>
          <SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem>
          <SelectItem value="cet">Central European Time (CET)</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Asia</SelectLabel>
          <SelectItem value="ist">India Standard Time (IST)</SelectItem>
          <SelectItem value="jst">Japan Standard Time (JST)</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
};

// Disabled state
export const Disabled: Story = {
  render: () => (
    <Select disabled>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="orange">Orange</SelectItem>
      </SelectContent>
    </Select>
  )
};

// With disabled items
export const WithDisabledItems: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a size" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="xs">Extra Small</SelectItem>
        <SelectItem value="sm">Small</SelectItem>
        <SelectItem value="md">Medium</SelectItem>
        <SelectItem value="lg" disabled>
          Large (Out of stock)
        </SelectItem>
        <SelectItem value="xl" disabled>
          Extra Large (Out of stock)
        </SelectItem>
      </SelectContent>
    </Select>
  )
};

// Long list with scrolling
export const LongList: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select a country" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="us">United States</SelectItem>
        <SelectItem value="ca">Canada</SelectItem>
        <SelectItem value="mx">Mexico</SelectItem>
        <SelectItem value="br">Brazil</SelectItem>
        <SelectItem value="ar">Argentina</SelectItem>
        <SelectItem value="uk">United Kingdom</SelectItem>
        <SelectItem value="fr">France</SelectItem>
        <SelectItem value="de">Germany</SelectItem>
        <SelectItem value="it">Italy</SelectItem>
        <SelectItem value="es">Spain</SelectItem>
        <SelectItem value="pt">Portugal</SelectItem>
        <SelectItem value="nl">Netherlands</SelectItem>
        <SelectItem value="be">Belgium</SelectItem>
        <SelectItem value="ch">Switzerland</SelectItem>
        <SelectItem value="at">Austria</SelectItem>
        <SelectItem value="pl">Poland</SelectItem>
        <SelectItem value="jp">Japan</SelectItem>
        <SelectItem value="cn">China</SelectItem>
        <SelectItem value="kr">South Korea</SelectItem>
        <SelectItem value="in">India</SelectItem>
        <SelectItem value="au">Australia</SelectItem>
        <SelectItem value="nz">New Zealand</SelectItem>
      </SelectContent>
    </Select>
  )
};

// Complete EditModal example (from wireframe)
export const EditModalForm: Story = {
  name: "Use Case: Edit Modal Form",
  render: () => (
    <div className="w-full max-w-md space-y-4 p-6 border border-gray-200 rounded-lg bg-white">
      <h2 className="text-lg font-semibold mb-4">Edit Requirement: req-002</h2>

      <div className="space-y-2">
        <label className="block text-sm font-medium">ID:</label>
        <input
          type="text"
          value="req-002"
          disabled
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Category:</label>
        <Select defaultValue="props">
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="props">Props</SelectItem>
            <SelectItem value="events">Events</SelectItem>
            <SelectItem value="states">States</SelectItem>
            <SelectItem value="accessibility">Accessibility</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Name:</label>
        <input
          type="text"
          defaultValue="size"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Type:</label>
        <Select defaultValue="string">
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="string">string</SelectItem>
            <SelectItem value="boolean">boolean</SelectItem>
            <SelectItem value="number">number</SelectItem>
            <SelectItem value="function">function</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Values (comma-separated):
        </label>
        <input
          type="text"
          defaultValue="sm, md, lg"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-3 mt-6">
        <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium">
          Save Changes
        </button>
        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium">
          Cancel
        </button>
      </div>
    </div>
  )
};

// Accessibility test
export const AccessibilityTest: Story = {
  name: "Accessibility Test",
  render: () => (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Keyboard Navigation Test</h3>
      <p className="text-sm text-gray-600">
        Tab to focus, Enter/Space to open, Arrow keys to navigate, Enter to
        select
      </p>
      <div className="space-y-3">
        <div className="space-y-2">
          <label htmlFor="select-1" className="block text-sm font-medium">
            First Select
          </label>
          <Select>
            <SelectTrigger id="select-1" className="w-[200px]">
              <SelectValue placeholder="Choose option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Option 1</SelectItem>
              <SelectItem value="2">Option 2</SelectItem>
              <SelectItem value="3">Option 3</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="select-2" className="block text-sm font-medium">
            Second Select
          </label>
          <Select>
            <SelectTrigger id="select-2" className="w-[200px]">
              <SelectValue placeholder="Choose option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a">Option A</SelectItem>
              <SelectItem value="b">Option B</SelectItem>
              <SelectItem value="c">Option C</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="select-3" className="block text-sm font-medium">
            Disabled Select
          </label>
          <Select disabled>
            <SelectTrigger id="select-3" className="w-[200px]">
              <SelectValue placeholder="Cannot select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="x">Should not be accessible</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  ),
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: "color-contrast",
            enabled: true
          },
          {
            id: "label",
            enabled: true
          },
          {
            id: "aria-required-attr",
            enabled: true
          },
          {
            id: "aria-valid-attr-value",
            enabled: true
          }
        ]
      }
    }
  }
};
