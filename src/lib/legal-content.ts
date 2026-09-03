export type LegalSection = { title: string; body: string };
export type LegalContent = {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  lede: string;
  updated: string;
  sections: LegalSection[];
  contactTitle?: string;
  contactBody?: string;
  note?: string;
};

export const legalContent: Record<"privacy" | "terms" | "accessibility", {
  en: LegalContent;
  zh: LegalContent;
}> = {
  privacy: {
    en: {
      metaTitle: "Privacy Policy",
      metaDescription:
        "Shakya.work privacy policy — what data we collect, why, who we share it with, and your GDPR and CCPA rights.",
      eyebrow: "Legal",
      title: "Privacy Policy",
      lede: "Plain-language details on what data this site collects, why, who it is shared with, and your rights.",
      updated: "Last updated: 27 August 2026",
      sections: [
        {
          title: "Overview",
          body: "This site (shakya.work) is a personal portfolio and product site operated by Shakya (\"I\", \"me\"). It is a lightweight site — there is no login, no advertising and no third-party ad tracking. I only collect the minimum data needed to respond to you and to render the site.",
        },
        {
          title: "What personal data I collect",
          body: "Your name and email address when you submit the contact form or request access to the Ideas Vault, together with the message you type. When you visit the private CV page after entering the access code, I log anonymized analytics data (IP address, approximate location, user agent, referrer and timestamp) in a local file for the sole purpose of understanding visitor interest. Standard server logs (IP address, requested path, user agent, timestamp) are kept by the hosting platform for security and uptime. Web fonts are loaded from Google Fonts, which means your browser shares your IP address and request metadata with Google for that request alone.",
        },
        {
          title: "Why I collect it",
          body: "The contact-form name and email let me reply to your message. Vault-access requests let me vet and issue codes to recruiters and clients. CV-page analytics help me understand interest in the private resume and are never used to identify or track individuals outside the site. Server logs help me keep the site running and defend against abuse. Google Fonts delivers the typography that makes the site readable.",
        },
        {
          title: "Who I share it with",
          body: "Google LLC receives your IP address and request metadata solely to serve the Google Fonts files; its handling of that data is governed by its own privacy policy. My hosting provider may retain standard server logs under its own terms. I do not share your data with anyone else except where required by law.",
        },
        {
          title: "How I protect it",
          body: "The site is served over HTTPS so form submissions and font requests are encrypted in transit. Access to submitted messages is limited to me, the site owner. I keep contact-form messages only as long as necessary to handle your inquiry, then delete them.",
        },
        {
          title: "Your rights (GDPR & CCPA)",
          body: "Depending on where you live you can ask what data I hold about you, ask me to correct it, ask me to delete it, opt out of processing, or request a copy in a portable format. To exercise any of these rights, email creationpanel@gmail.com. I will respond within the timeframes required by law (generally within 30 days). You also have the right to complain to your local data-protection authority.",
        },
      ],
      contactTitle: "Data-request contact",
      contactBody: "For any privacy question or data request: creationpanel@gmail.com",
      note: "This policy may change as the site evolves. Material changes will be reflected by the \"Last updated\" date above.",
    },
    zh: {
      metaTitle: "隐私政策",
      metaDescription:
        "Shakya.work 隐私政策——我们收集哪些数据、为何收集、与谁共享，以及你的 GDPR 与 CCPA 权利。",
      eyebrow: "法律",
      title: "隐私政策",
      lede: "用通俗语言说明本站收集哪些数据、为什么收集、与谁共享，以及你的权利。",
      updated: "最后更新：2026 年 8 月 27 日",
      sections: [
        {
          title: "概述",
          body: "本站（shakya.work）是由 Shakya（“我”）运营的个人作品集与产品展示网站。网站为轻量级站点，没有登录、广告或第三方广告追踪。我仅收集回复你与渲染页面所需的最少数据。",
        },
        {
          title: "我收集哪些个人数据",
          body: "你通过联系表单或资源库申请提交时提供的姓名与邮箱，以及你在留言中输入的内容。在你输入访问码进入私密简历页后，我会将匿名化的分析数据（IP 地址、大致位置、用户代理、来源页面与时间戳）记录在本地文件中，仅用于了解访问兴趣。托管平台可能保留标准服务器日志（IP 地址、请求路径、用户代理、时间戳），用于安全与可用性。页面字体由 Google Fonts 加载，因此你的浏览器会向 Google 共享你的 IP 地址与请求元数据，仅用于本次字体请求。",
        },
        {
          title: "收集目的",
          body: "联系表单中的姓名和邮箱用于回复你的留言。资源库访问申请用于向招聘方与客户审核并发放访问码。简历页分析数据用于了解私密简历的访问兴趣，不会用于在本站之外识别或追踪个人。服务器日志用于保障站点稳定运行并防御滥用。Google Fonts 用于提供清晰、可读的页面排版。",
        },
        {
          title: "与谁共享",
          body: "Google LLC 仅为提供字体而接收你的 IP 与请求元数据，其处理行为受其自身隐私政策约束。我的托管服务商可能依据其条款保留标准服务器日志。除法律要求外，我不会再与任何第三方共享你的数据。",
        },
        {
          title: "如何保护",
          body: "本站通过 HTTPS 提供服务，因此表单提交与字体请求在传输过程中被加密。只有我（站点所有者）可访问收到的留言。联系表单留言仅在处理你所需的时间内保留，处理完成后即删除。",
        },
        {
          title: "你的权利（GDPR 与 CCPA）",
          body: "根据你所在的地区，你可以询问我持有你的哪些数据，要求更正，要求删除，退出处理，或以可移植格式获取副本。如需行使上述任何权利，请发送邮件至 creationpanel@gmail.com。我将在法律规定的时限内（通常 30 天内）回复。你也有权向当地数据保护机构投诉。",
        },
      ],
      contactTitle: "数据请求联系方式",
      contactBody: "任何隐私问题或数据请求：creationpanel@gmail.com",
      note: "随着站点演进，本政策可能更新。重要变更将通过上方的“最后更新”日期体现。",
    },
  },
  terms: {
    en: {
      metaTitle: "Terms of Service",
      metaDescription:
        "Shakya.work terms of service — acceptable use, intellectual property, disclaimers and how disputes are handled.",
      eyebrow: "Legal",
      title: "Terms of Service",
      lede: "The rules for using shakya.work. By using the site you agree to these terms.",
      updated: "Last updated: 27 August 2026",
      sections: [
        {
          title: "1. Acceptance of terms",
          body: "By accessing or using shakya.work (the \"Site\") you agree to these Terms of Service. If you do not agree, please do not use the Site.",
        },
        {
          title: "2. Acceptable use",
          body: "You may use the Site for lawful, personal or business-evaluation purposes. You agree not to send spam, harass anyone, transmit unlawful content, attempt to probe or attack the Site, scrape or republish substantial parts of it, misrepresent your affiliation with Shakya, or attempt to bypass access controls on private pages such as /vault or /cv.",
        },
        {
          title: "3. Intellectual property",
          body: "All content on the Site — text, design, code, graphics, logos, product names and demos — is the property of Shakya or its licensors and is protected by applicable copyright, trademark and other intellectual-property laws. The brand name, logo and visual identity are trademarks of Shakya. You may view and reference the Site for your own use, but no part may be reproduced, modified or redistributed for commercial purposes without prior written permission.",
        },
        {
          title: "4. Disclaimer of warranties",
          body: "The Site and its content are provided \"as is\" and \"as available\" without warranties of any kind, express or implied. Demos, simulations and analysis tools — including the trading analysis platform — are illustrative only and are not financial advice. Private pages such as /cv and /vault, and previews marked \"coming soon\" such as /wt, are provided for evaluation only and may be incomplete or change without notice.",
        },
        {
          title: "5. Limitation of liability",
          body: "To the maximum extent permitted by law, Shakya shall not be liable for any indirect, incidental, special, consequential or punitive damages, or any loss of data or profits, arising from your use of, or inability to use, the Site. Nothing in these terms excludes liability that cannot lawfully be excluded.",
        },
        {
          title: "6. Dispute resolution",
          body: "These terms are governed by the laws of the jurisdiction in which Shakya operates, without regard to conflict-of-law principles. Any dispute will first be addressed informally by contacting creationpanel@gmail.com; if it remains unresolved, it will be settled by the competent courts of that jurisdiction.",
        },
        {
          title: "7. Termination",
          body: "I may suspend or block access to the Site at any time, for any reason, including if you breach these terms. Sections relating to IP ownership, disclaimers, limitation of liability and governing law survive any termination.",
        },
        {
          title: "8. Changes to these terms",
          body: "I may update these terms as the Site evolves. Changes take effect when posted, with the \"Last updated\" date revised. Continued use after changes constitutes acceptance of the updated terms.",
        },
      ],
      note: "© 2026 Shakya. All rights reserved.",
    },
    zh: {
      metaTitle: "使用条款",
      metaDescription:
        "Shakya.work 使用条款——可接受的使用、知识产权、免责声明与争议处理方式。",
      eyebrow: "法律",
      title: "使用条款",
      lede: "使用 Shakya.work 的规则。访问即表示你同意这些条款。",
      updated: "最后更新：2026 年 8 月 27 日",
      sections: [
        {
          title: "1. 接受条款",
          body: "访问或使用 Shakya.work（以下简称“本站”）即表示你同意本使用条款。如不同意，请勿使用本站。",
        },
        {
          title: "2. 可接受的使用",
          body: "你只能为合法、个人或业务评估目的使用本站。不得发送垃圾信息、骚扰他人、传输违法内容、试图探测或攻击本站、抓取或大量转载本站内容、冒用与 Shakya 的关联，或试图绕过 /vault、/cv 等私密页面的访问控制。",
        },
        {
          title: "3. 知识产权",
          body: "本站所有内容——包括文字、设计、代码、图形、徽标、产品名称与演示——均为 Shakya 或其许可方的财产，受相关版权、商标及其他知识产权法律保护。品牌名称、徽标与视觉形象均为 Shakya 的商标。你可以出于个人用途浏览和引用本站，但未经事先书面许可，不得以商业目的复制、修改或再分发任何部分。",
        },
        {
          title: "4. 免责声明",
          body: "本站及其内容按“现状”与“可用”原则提供，不作任何明示或暗示的担保。演示、模拟与分析工具（包括交易分析平台）仅供说明之用，不构成任何投资建议。/cv、/vault 等私密页面，以及标注“即将上线”的预览页面（如 /wt）仅用于评估，可能不完整或随时变更。",
        },
        {
          title: "5. 责任限制",
          body: "在法律允许的最大范围内，Shakya 不对因使用或无法使用本站而产生的任何间接、附带、特殊、后果性或惩罚性损害，或任何数据或利润损失承担责任。本条款不排除法律不能排除的责任。",
        },
        {
          title: "6. 争议解决",
          body: "本条款受 Shakya 所在司法管辖区法律管辖，不适用冲突法规则。任何争议应首先通过发送邮件至 creationpanel@gmail.com 尝试协商解决；如未能解决，争议将提交该司法管辖区有管辖权的法院处理。",
        },
        {
          title: "7. 终止",
          body: "我可能随时因任何原因（包括你违反本条款）暂停或阻止访问本站。与知识产权、免责声明、责任限制和适用法律相关的条款在任何终止后仍然有效。",
        },
        {
          title: "8. 条款变更",
          body: "随着本站演进，我可能更新本条款。变更在发布时生效，“最后更新”日期将相应调整。变更发布后继续使用即表示你接受更新后的条款。",
        },
      ],
      note: "© 2026 Shakya。保留所有权利。",
    },
  },
  accessibility: {
    en: {
      metaTitle: "Accessibility Statement",
      metaDescription:
        "Shakya.work accessibility statement — our WCAG 2.1/2.2 AA commitments, the measures we take, and known gaps.",
      eyebrow: "Legal",
      title: "Accessibility Statement",
      lede: "My commitment to making shakya.work usable by as many people as possible.",
      updated: "Last updated: 27 August 2026",
      sections: [
        {
          title: "Conformance target",
          body: "Shakya.work aims to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 and 2.2 at Level AA. These guidelines explain how to make web content more accessible to people with a wide range of disabilities and improve usability for everyone.",
        },
        {
          title: "Measures I take",
          body: "Semantic HTML with a logical heading order and a skip-to-content link. Visible keyboard focus styles and full operation by keyboard. A responsive layout that works from mobile to desktop, and support for prefers-reduced-motion. A light/dark theme toggle for reader comfort.",
        },
        {
          title: "Known gaps",
          body: "The site is not yet fully compliant. The trading analysis page renders a canvas chart; while it has a textual summary, it does not yet expose a full keyboard-accessible alternative. The AI voice guide requires JavaScript and browser speech support to play audio. The /vault access form and private /cv content are functional but have not yet been fully audited for accessibility. I review the site against WCAG as part of ongoing maintenance and prioritize fixes that affect core reading and navigation.",
        },
        {
          title: "Feedback",
          body: "If you find an accessibility barrier or have a suggestion, please email creationpanel@gmail.com. I read every message and aim to respond within a reasonable time.",
        },
      ],
      note: "This statement applies to shakya.work. It does not cover third-party sites I may link to.",
    },
    zh: {
      metaTitle: "无障碍声明",
      metaDescription:
        "Shakya.work 无障碍声明——我们的 WCAG 2.1/2.2 AA 承诺、已采取的措施与已知不足。",
      eyebrow: "法律",
      title: "无障碍声明",
      lede: "我们致力于让 Shakya.work 尽可能被更多人使用。",
      updated: "最后更新：2026 年 8 月 27 日",
      sections: [
        {
          title: "目标标准",
          body: "Shakya.work 致力于符合《Web 内容无障碍指南》（WCAG）2.1 与 2.2 AA 级。这些指南说明如何让残障人士更易于访问网页内容，并提升所有人的可用性。",
        },
        {
          title: "已采取的措施",
          body: "使用语义化 HTML，保持标题层级清晰，并提供“跳到内容”链接。可见键盘焦点样式，支持全键盘操作。从移动端到桌面端的响应式布局，并支持 prefers-reduced-motion。提供浅色 / 深色主题切换，照顾阅读舒适度。",
        },
        {
          title: "已知不足",
          body: "本站尚未完全合规。交易分析页使用画布图表，目前虽提供文字摘要，但尚未提供完整的键盘可访问替代方案。AI 语音导览需要启用 JavaScript 与浏览器语音支持才能播放音频。/vault 访问表单与私密 /cv 内容已可用，但尚未完成完整的无障碍审计。我会持续按 WCAG 评估并优先修复影响核心阅读和导航的问题。",
        },
        {
          title: "反馈",
          body: "如果你发现任何无障碍障碍或有改进建议，请发送邮件至 creationpanel@gmail.com。我会阅读每一条消息，并力争在合理时间内回复。",
        },
      ],
      note: "本声明适用于 Shakya.work，不涵盖可能链接到的第三方站点。",
    },
  },
};
