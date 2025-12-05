<script setup lang="ts">
import BaseIcon from '@/components/BaseIcon.vue'
import AsterIcon from '@/assets/icons/ecosystem/aster.svg'
import FourIcon from '@/assets/icons/ecosystem/four.svg'
import ListaIcon from '@/assets/icons/ecosystem/lista.svg'
import PancakeIcon from '@/assets/icons/ecosystem/pancake.svg'
import StandXIcon from '@/assets/icons/ecosystem/standX.svg'
import ThenaIcon from '@/assets/icons/ecosystem/thena.svg'
import VenusIcon from '@/assets/icons/ecosystem/venus.svg'

type EcosystemLink = {
  title: string
  description: string
  icon: any
  href: string
}

const allEcosystemLinks: EcosystemLink[] = [
  {
    title: 'PancakeSwap',
    description:
      'PancakeSwap is a leading DEX on BNB Chain that allows users to swap tokens, provide liquidity, and earn rewards through farming and staking.',
    icon: PancakeIcon,
    href: '#',
  },
  {
    title: 'Aster',
    description:
      'Aster is a next-generation decentralized exchange offering both Perpetual and Spot trading, designed as a one-stop onchain venue for global crypto traders.',
    icon: AsterIcon,
    href: '#',
  },
  {
    title: 'StandX',
    description:
      'StandX is a decentralized perpetual exchange. It also launched the stablecoin $DUSD, which can be used for perpetual trading and earning interest.',
    icon: StandXIcon,
    href: '#',
  },
  {
    title: 'Four',
    description:
      'Four is a meme-token launchpad on BNB Chain that allows users to create, launch, and trade meme tokens with low fees.',
    icon: FourIcon,
    href: '#',
  },
  {
    title: 'Lista DAO',
    description:
      'Lista DAO is a liquid staking and decentralized stablecoin protocol. Users can undergo staking and liquid staking on Lista, as well as borrow lisUSD against a variety of decentralized collateral.',
    icon: ListaIcon,
    href: '#',
  },
  {
    title: 'Venus',
    description:
      'Venus is a decentralized lending protocol on BNB Chain where users can supply assets to earn interest or borrow against their collateral.',
    icon: VenusIcon,
    href: '#',
  },
  {
    title: 'THENA',
    description: 'Thena (THE), the DEX and liquidity layer built on BNB Chain and opBNB.',
    icon: ThenaIcon,
    href: '#',
  },
]
</script>

<template>
  <section class="mt-4 flex flex-col gap-12 text-[var(--hp-white-color)]">
    <div class="flex flex-col gap-6">
      <header class="flex flex-col gap-2">
        <h1 class="text-2xl font-semibold leading-8">Ecosystem Dashboard</h1>
      </header>

      <div class="grid gap-4 md:grid-cols-3">
        <article
          v-for="link in allEcosystemLinks"
          :key="link.title"
          class="flex h-[176px] flex-col gap-5 bg-[var(--hp-bg-normal)] px-6 pb-6 pt-5"
        >
          <div class="flex items-center gap-3">
            <img :src="link.icon" class="h-[32px] w-[32px]" />
            <a
              :href="link.href"
              target="_blank"
              rel="noreferrer"
              class="group inline-flex items-center gap-2 text-base font-semibold leading-6"
            >
              <span class="group-hover:text-[var(--hp-primary-green)]">{{ link.title }}</span>
              <BaseIcon
                name="link"
                size="16"
                class="text-[var(--hp-text-color)] group-hover:text-[var(--hp-primary-green)]"
              />
            </a>
          </div>
          <p class="text-sm leading-5 text-[var(--hp-text-color)]">{{ link.description }}</p>
        </article>
      </div>
    </div>
  </section>
</template>
