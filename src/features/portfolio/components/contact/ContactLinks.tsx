import { Github, Linkedin, Mail } from 'lucide-react'
import { EnvelopeDoodle } from '@/shared/components/Doodles'
import { ExternalLink } from '@/shared/components/ExternalLink'
import { siteConfig } from '@/data/siteConfig'
import { unlock } from '@/features/achievements'
import { isSafeExternalUrl } from '@/shared/utils/links'

const socialIcons = {
  github: <Github size={15} />,
  linkedin: <Linkedin size={15} />,
  other: null,
}

export function ContactLinks() {
  return (
    <div className="space-y-8">
      <div data-reveal className="text-ink" aria-hidden="true">
        <EnvelopeDoodle className="w-40" />
      </div>
      <div data-reveal>
        <h3 className="font-hand text-2xl text-terracotta">Email</h3>
        <ExternalLink
          href={`mailto:${siteConfig.contact.email}`}
          icon={<Mail size={15} />}
          className="mt-1 text-lg"
          onClick={() => unlock('sociable')}
        >
          {siteConfig.contact.email}
        </ExternalLink>
      </div>
      <div data-reveal>
        <h3 className="font-hand text-2xl text-terracotta">Elsewhere</h3>
        <ul className="mt-1 flex flex-col gap-2">
          {siteConfig.social
            .filter((link) => isSafeExternalUrl(link.url))
            .map((link) => (
              <li key={link.id}>
                <ExternalLink
                  href={link.url}
                  icon={socialIcons[link.id]}
                  className="text-lg"
                  onClick={() => unlock('sociable')}
                >
                  {link.label}
                </ExternalLink>
              </li>
            ))}
        </ul>
      </div>
    </div>
  )
}
