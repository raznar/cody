import type { Model } from '.'
import {
    CHAT_INPUT_TOKEN_BUDGET,
    CHAT_OUTPUT_TOKEN_BUDGET,
    EXTENDED_CHAT_INPUT_TOKEN_BUDGET,
    EXTENDED_USER_CONTEXT_TOKEN_BUDGET,
} from '../token/constants'

import { type ModelContextWindow, ModelUsage } from './types'
import { ModelUIGroup } from './utils'

const basicContextWindow: ModelContextWindow = {
    input: CHAT_INPUT_TOKEN_BUDGET,
    output: CHAT_OUTPUT_TOKEN_BUDGET,
}
const expandedContextWindow: ModelContextWindow = {
    input: EXTENDED_CHAT_INPUT_TOKEN_BUDGET,
    output: CHAT_OUTPUT_TOKEN_BUDGET,
    context: { user: EXTENDED_USER_CONTEXT_TOKEN_BUDGET },
}

/**
 * Returns an array of Models representing the default models for DotCom.
 * The order listed here is the order shown to users. Put the default LLM first.
 *
 * NOTE: The models MUST first be added to the custom chat models list in Cody Gateway.
 * @link https://sourcegraph.com/github.com/sourcegraph/sourcegraph/-/blob/internal/completions/httpapi/chat.go?L48-51
 *
 * @returns An array of `Models` objects.
 */
export const DEFAULT_DOT_COM_MODELS = [
    // --------------------------------
    // Anthropic models
    // --------------------------------
    {
        title: 'Claude 3 Sonnet',
        model: 'anthropic/claude-3-sonnet-20240229',
        provider: 'Anthropic',
        default: true,
        codyProOnly: false,
        usage: [ModelUsage.Chat, ModelUsage.Edit],
        // Has a higher context window with a separate limit for user-context.
        contextWindow: expandedContextWindow,
        deprecated: false,
        uiGroup: ModelUIGroup.Balanced,
    },
    {
        title: 'Claude 3.5 Sonnet',
        model: 'anthropic/claude-3-5-sonnet-20240620',
        provider: 'Anthropic',
        default: false,
        codyProOnly: true,
        usage: [ModelUsage.Chat, ModelUsage.Edit],
        // Has a higher context window with a separate limit for user-context.
        contextWindow: expandedContextWindow,
        deprecated: false,
        uiGroup: ModelUIGroup.Accuracy,
    },
    {
        title: 'Claude 3 Opus',
        model: 'anthropic/claude-3-opus-20240229',
        provider: 'Anthropic',
        default: false,
        codyProOnly: true,
        usage: [ModelUsage.Chat, ModelUsage.Edit],
        // Has a higher context window with a separate limit for user-context.
        contextWindow: expandedContextWindow,
        deprecated: false,
        uiGroup: ModelUIGroup.Accuracy,
    },
    {
        title: 'Claude 3 Haiku',
        model: 'anthropic/claude-3-haiku-20240307',
        provider: 'Anthropic',
        default: false,
        codyProOnly: true,
        usage: [ModelUsage.Chat, ModelUsage.Edit],
        contextWindow: basicContextWindow,
        deprecated: false,
        uiGroup: ModelUIGroup.Speed,
    },

    // --------------------------------
    // OpenAI models
    // --------------------------------
    {
        title: 'GPT-4o',
        model: 'openai/gpt-4o',
        provider: 'OpenAI',
        default: false,
        codyProOnly: true,
        usage: [ModelUsage.Chat, ModelUsage.Edit],
        // Has a higher context window with a separate limit for user-context.
        contextWindow: expandedContextWindow,
        deprecated: false,
        uiGroup: ModelUIGroup.Accuracy,
    },
    {
        title: 'GPT-4 Turbo',
        model: 'openai/gpt-4-turbo',
        provider: 'OpenAI',
        default: false,
        codyProOnly: true,
        usage: [ModelUsage.Chat, ModelUsage.Edit],
        contextWindow: basicContextWindow,
        deprecated: false,
        uiGroup: ModelUIGroup.Balanced,
    },
    {
        title: 'GPT-3.5 Turbo',
        model: 'openai/gpt-3.5-turbo',
        provider: 'OpenAI',
        default: false,
        codyProOnly: true,
        usage: [ModelUsage.Chat, ModelUsage.Edit],
        contextWindow: basicContextWindow,
        deprecated: false,
        uiGroup: ModelUIGroup.Speed,
    },

    // --------------------------------
    // Google models
    // --------------------------------
    {
        title: 'Gemini 1.5 Pro',
        model: 'google/gemini-1.5-pro-latest',
        provider: 'Google',
        default: false,
        codyProOnly: true,
        usage: [ModelUsage.Chat, ModelUsage.Edit],
        contextWindow: expandedContextWindow,
        deprecated: false,
        uiGroup: ModelUIGroup.Accuracy,
    },
    {
        title: 'Gemini 1.5 Flash',
        model: 'google/gemini-1.5-flash-latest',
        provider: 'Google',
        default: false,
        codyProOnly: true,
        usage: [ModelUsage.Chat, ModelUsage.Edit],
        contextWindow: expandedContextWindow,
        deprecated: false,
        uiGroup: ModelUIGroup.Speed,
    },

    // TODO (tom) Improve prompt for Mixtral + Edit to see if we can use it there too.
    {
        title: 'Mixtral 8x7B',
        model: 'fireworks/accounts/fireworks/models/mixtral-8x7b-instruct',
        provider: 'Mistral',
        default: false,
        codyProOnly: true,
        usage: [ModelUsage.Chat],
        contextWindow: basicContextWindow,
        deprecated: false,
        uiGroup: ModelUIGroup.Speed,
    },
    {
        title: 'Mixtral 8x22B',
        model: 'fireworks/accounts/fireworks/models/mixtral-8x22b-instruct',
        provider: 'Mistral',
        default: false,
        codyProOnly: true,
        usage: [ModelUsage.Chat],
        contextWindow: basicContextWindow,
        deprecated: false,
        uiGroup: ModelUIGroup.Accuracy,
    },

    // --------------------------------
    // Deprecated models
    // --------------------------------
    {
        title: 'Claude 2.0',
        model: 'anthropic/claude-2.0',
        provider: 'Anthropic',
        default: false,
        codyProOnly: true,
        usage: [ModelUsage.Chat, ModelUsage.Edit],
        contextWindow: basicContextWindow,
        deprecated: true,
    },
    {
        title: 'Claude 2.1',
        model: 'anthropic/claude-2.1',
        provider: 'Anthropic',
        default: false,
        codyProOnly: true,
        usage: [ModelUsage.Chat, ModelUsage.Edit],
        contextWindow: basicContextWindow,
        deprecated: true,
    },
    {
        title: 'Claude Instant',
        model: 'anthropic/claude-instant-1.2',
        provider: 'Anthropic',
        default: false,
        codyProOnly: true,
        usage: [ModelUsage.Chat, ModelUsage.Edit],
        contextWindow: basicContextWindow,
        deprecated: true,
    },
] as const satisfies Model[]

/**
 * Returns an array of Models representing the default models for DotCom.
 *
 * @returns An array of `Models` objects.
 */
export function getDotComDefaultModels(): Model[] {
    return DEFAULT_DOT_COM_MODELS
}
