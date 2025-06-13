import { LucideUser, PhoneIcon, StarIcon } from "lucide-react";
import { PropsWithChildren } from "react";

import { ChatHeader } from "./components/chat/ChatHeader";
import { ChatInput } from "./components/chat/ChatInput";
import { Badge } from "./components/ui/Badge";
import { Button } from "./components/ui/Button";
import { Card } from "./components/ui/Card";
import { Dropdown } from "./components/ui/Dropdown";
import { Input } from "./components/ui/Input";
import { Modal } from "./components/ui/Modal";
import { PasswordInput } from "./components/ui/PasswordInput";
import { Slider } from "./components/ui/Slider";
import { Switch } from "./components/ui/Switch";
import { Textarea } from "./components/ui/TextArea";
import { useDisclosure } from "./hooks/useDisclosure";

const Section = ({
  children,
  title,
}: PropsWithChildren & { title: string }) => {
  return (
    <div className="my-4 flex flex-col bg-gradient-to-r from-primary-50 to-secondary-100 p-5 rounded-lg">
      <h2 className="font-bold text-2xl">{title}</h2>
      <div className="my-4 flex gap-5">{children}</div>
    </div>
  );
};

function App() {
  const modal = useDisclosure();

  return (
    <div className="p-5">
      <Section title="Buttons">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
      </Section>

      <Section title="Badges">
        <Badge variant="default" size="lg">
          Default
        </Badge>
        <Badge variant="success" size="lg">
          Success
        </Badge>
        <Badge variant="warning" size="md">
          Warning
        </Badge>
        <Badge variant="danger" size="md">
          Danger
        </Badge>
        <Badge variant="primary" size="sm">
          Primary
        </Badge>
        <Badge variant="secondary" size="sm">
          Secondary
        </Badge>
      </Section>

      <Section title="Card">
        <Card variant="default">Default</Card>
        <Card variant="glass">Glass</Card>
        <Card variant="solid">Solid</Card>
      </Section>

      <Section title="Dropdown">
        <Dropdown
          options={[
            { label: "Option Label", value: "1" },
            { label: "With Icon", value: "2", icon: LucideUser },
          ]}
          onSelect={() => {}}
        />

        <Dropdown
          options={[
            { label: "Option Label", value: "1" },
            { label: "With Icon", value: "2", icon: LucideUser },
          ]}
          onSelect={() => {}}
          disabled
        />
      </Section>

      <Section title="Input">
        <Input
          label="Label"
          helperText="Helper text"
          placeholder="Placeholder"
          icon={StarIcon}
        />

        <Input
          label="Label"
          helperText="Helper text"
          placeholder="Placeholder"
          error={true}
          icon={PhoneIcon}
          iconPosition="right"
        />

        <Input
          label="Label"
          helperText="Helper text"
          placeholder="Placeholder"
          success={true}
        />

        <Input
          label="Label"
          helperText="Helper text"
          placeholder="Placeholder"
          disabled
        />

        <PasswordInput
          label="PasswordInput"
          helperText="Helper text"
          placeholder="*********"
        />
      </Section>

      <Section title="Modal">
        <Button onClick={modal.onOpen}>Open Modal</Button>

        <Modal title="Title" onClose={modal.onClose} isOpen={modal.isOpen}>
          <p>Modal content</p>
        </Modal>
      </Section>

      <Section title="Slider">
        <Slider
          label="Label"
          description="Description"
          className="w-[300px]"
          onChange={(value) => console.log(value)}
          value={50}
        />

        <Slider
          label="Label"
          description="Description"
          className="w-[300px]"
          onChange={(value) => console.log(value)}
          value={50}
          disabled
        />
      </Section>

      <Section title="Switch">
        <Switch
          label="Label"
          description="Description"
          onChange={(value) => console.log(value)}
          checked
        />

        <Switch
          label="Label"
          description="Description"
          onChange={(value) => console.log(value)}
          checked={false}
        />

        <Switch
          label="Label"
          description="Description"
          onChange={(value) => console.log(value)}
          checked
          disabled
        />
      </Section>

      <Section title="Text Area">
        <Textarea className="p-2" autoResize />
      </Section>

      <Section title="Chat Input">
        <ChatInput onSendMessage={() => {}} isLoading={false} />
      </Section>

      <Section title="Chat Input">
        <ChatHeader chat={null} models={[{}]} />
      </Section>
    </div>
  );
}

export default App;
