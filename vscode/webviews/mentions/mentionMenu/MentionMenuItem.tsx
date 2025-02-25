import {
    type ContextItem,
    type ContextMentionProviderMetadata,
    FILE_CONTEXT_MENTION_PROVIDER,
    type MentionQuery,
    SYMBOL_CONTEXT_MENTION_PROVIDER,
    displayLineRange,
    displayPath,
    displayPathBasename,
    displayPathDirname,
} from '@sourcegraph/cody-shared'
import { clsx } from 'clsx'
import {
    ArrowRightIcon,
    DatabaseIcon,
    FileIcon,
    FolderGitIcon,
    LibraryBigIcon,
    LinkIcon,
    SmileIcon,
    SquareFunctionIcon,
} from 'lucide-react'
import type { FunctionComponent } from 'react'
import {
    IGNORED_FILE_WARNING_LABEL,
    LARGE_FILE_WARNING_LABEL,
} from '../../../src/chat/context/constants'
import RemoteFileProvider from '../../../src/context/openctx/remoteFileSearch'
import RemoteRepositorySearch from '../../../src/context/openctx/remoteRepositorySearch'
import WebProvider from '../../../src/context/openctx/web'
import ConfluenceLogo from '../../icons/providers/confluence.svg?react'
import GithubLogo from '../../icons/providers/github.svg?react'
import GoogleLogo from '../../icons/providers/google.svg?react'
import JiraLogo from '../../icons/providers/jira.svg?react'
import LinearLogo from '../../icons/providers/linear.svg?react'
import NotionLogo from '../../icons/providers/notion.svg?react'
import SentryLogo from '../../icons/providers/sentry.svg?react'
import SlackLogo from '../../icons/providers/slack.svg?react'
import SourcegraphLogo from '../../icons/providers/sourcegraph.svg?react'
import styles from './MentionMenuItem.module.css'

function getDescription(item: ContextItem, query: MentionQuery): string {
    if (item.description) {
        return item.description
    }

    const range = query.range ?? item.range
    const defaultDescription = `${displayPath(item.uri)}:${range ? displayLineRange(range) : ''}`

    switch (item.type) {
        case 'file': {
            const dir = decodeURIComponent(displayPathDirname(item.uri))
            return `${range ? `Lines ${displayLineRange(range)} · ` : ''}${dir === '.' ? '' : dir}`
        }
        case 'repository':
        case 'tree':
            return '' // no description since it's duplicative
        case 'openctx':
            return item.mention?.description || defaultDescription
        default:
            return defaultDescription
    }
}

export const MentionMenuContextItemContent: FunctionComponent<{
    query: MentionQuery
    item: ContextItem
}> = ({ query, item }) => {
    const isOpenCtx = item.type === 'openctx'
    const isFileType = item.type === 'file'
    const isSymbol = item.type === 'symbol'
    const icon =
        item.icon || (isSymbol ? (item.kind === 'class' ? 'symbol-structure' : 'symbol-method') : null)
    const title = item.title ?? (isSymbol ? item.symbolName : displayPathBasename(item.uri))
    const description = getDescription(item, query)

    const isIgnored = (isFileType || isOpenCtx) && item.isIgnored
    const isLargeFile = isFileType && item.isTooLarge
    let warning: string
    if (isIgnored) {
        warning = IGNORED_FILE_WARNING_LABEL
    } else if (isLargeFile && !item.range && !query.maybeHasRangeSuffix) {
        warning = LARGE_FILE_WARNING_LABEL
    } else {
        warning = ''
    }

    return (
        <>
            <div className={styles.row}>
                {icon && <i className={`codicon codicon-${icon}`} title={isSymbol ? item.kind : ''} />}
                <span className={clsx(styles.title, warning && styles.titleWithWarning)} title={title}>
                    {title}
                </span>
                {description && (
                    <span className={styles.description} title={description}>
                        {description}
                    </span>
                )}
            </div>
            {warning && <span className={styles.warning}>{warning}</span>}
        </>
    )
}

export const MentionMenuProviderItemContent: FunctionComponent<{
    provider: ContextMentionProviderMetadata
}> = ({ provider }) => {
    const Icon = iconForProvider[provider.id] ?? DatabaseIcon
    return (
        <div className={styles.row} title={provider.id}>
            <Icon size={16} strokeWidth={1.75} />
            {provider.title ?? provider.id}
            <ArrowRightIcon size={16} strokeWidth={1.25} style={{ opacity: '0.5' }} />
        </div>
    )
}

export const iconForProvider: Record<
    string,
    React.ComponentType<{
        size?: string | number
        strokeWidth?: string | number
    }>
> = {
    [FILE_CONTEXT_MENTION_PROVIDER.id]: FileIcon,
    [SYMBOL_CONTEXT_MENTION_PROVIDER.id]: SquareFunctionIcon,
    // todo(tim): OpenCtx providers should be able to specify an icon string, so
    // we don't have to hardcode these URLs and other people can have their own
    // GitHub provider etc.
    'https://openctx.org/npm/@openctx/provider-github': GithubLogo,
    'https://openctx.org/npm/@openctx/provider-confluence': ConfluenceLogo,
    'https://openctx.org/npm/@openctx/provider-jira-issues': JiraLogo,
    'https://openctx.org/npm/@openctx/provider-slack': SlackLogo,
    'https://openctx.org/npm/@openctx/provider-linear-issues': LinearLogo,
    'https://openctx.org/npm/@openctx/provider-linear-docs': LinearLogo,
    'https://openctx.org/npm/@openctx/provider-web': LinkIcon,
    'https://openctx.org/npm/@openctx/provider-google-docs': GoogleLogo,
    'https://openctx.org/npm/@openctx/provider-sentry': SentryLogo,
    'https://openctx.org/npm/@openctx/provider-notion': NotionLogo,
    'https://openctx.org/npm/@openctx/provider-hello-world': SmileIcon,
    'https://openctx.org/npm/@openctx/provider-devdocs': LibraryBigIcon,
    'https://openctx.org/npm/@openctx/provider-sourcegraph-search': SourcegraphLogo,
    [RemoteRepositorySearch.providerUri]: FolderGitIcon,
    [RemoteFileProvider.providerUri]: FolderGitIcon,
    [WebProvider.providerUri]: LinkIcon,
}
