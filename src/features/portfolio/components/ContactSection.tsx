import { siteConfig } from '@/data/siteConfig'
import { lowerMessage, useMessage } from '@/features/world/rooms/contact/messageStore'
import { useHasRoom } from '@/shared/store/worldStore'
import { ContactForm } from './contact/ContactForm'
import { ContactLinks } from './contact/ContactLinks'
import { useContactForm } from './contact/useContactForm'
import { SectionPanel } from './SectionPanel'

export function ContactSection() {
  const contact = useContactForm()
  const hasRoom = useHasRoom()
  const raised = useMessage((s) => s.raised)
  const hint =
    'Click a signpost on the pier to follow it, or pick up the paper on the crate to write a note.'

  if (hasRoom) {
    return (
      <SectionPanel
        id="contact"
        title="Let's talk."
        bare
        hint={hint}
        onEscape={raised ? lowerMessage : undefined}
      >
        <ContactForm contact={contact} />
      </SectionPanel>
    )
  }

  return (
    <SectionPanel
      id="contact"
      eyebrow="say hello"
      title="Let's talk."
      intro={siteConfig.contact.closingMessage}
      hint={hint}
    >
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <ContactLinks />
        <ContactForm contact={contact} />
      </div>
    </SectionPanel>
  )
}
