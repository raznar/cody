import { type Frame, type FrameLocator, type Locator, type Page, expect } from '@playwright/test'

import { SERVER_URL, VALID_TOKEN } from '../fixtures/mock-server'
import { executeCommandInPalette } from './helpers'

// Sign into Cody with valid auth from the sidebar
export const sidebarSignin = async (
    page: Page,
    sidebar: Frame | null,
    enableNotifications = false
): Promise<void> => {
    if (sidebar === null) {
        throw new Error('Sidebar is null, likely because preAuthenticate is `true`')
    }
    await focusSidebar(page)
    await sidebar.getByRole('button', { name: 'Sign In to Your Enterprise Instance' }).click()
    await page.getByRole('option', { name: 'Sign In with URL and Access Token' }).click()
    await page.getByRole('combobox', { name: 'input' }).fill(SERVER_URL)
    await page.getByRole('combobox', { name: 'input' }).press('Enter')
    await page.getByRole('combobox', { name: 'input' }).fill(VALID_TOKEN)
    await page.getByRole('combobox', { name: 'input' }).press('Enter')

    // TODO(beyang): re-enable when sidebar chat is enabled
    // // Close sidebar chat
    // await page.getByLabel('Chat Section').click()

    // Turn off notification
    if (!enableNotifications) {
        await disableNotifications(page)
    }

    await expectAuthenticated(page)
}

export async function closeSidebar(page: Page): Promise<void> {
    if (await isSidebarVisible(page)) {
        await page.click('[aria-label="Cody"]')
    }
}

async function isSidebarVisible(page: Page): Promise<boolean> {
    const sidebarsVisible = await Promise.all([
        page.getByRole('heading', { name: 'Cody: Chat' }).isVisible(),
        page.getByRole('heading', { name: 'Cody' }).isVisible(),
    ])
    return sidebarsVisible[0] || sidebarsVisible[1]
}

export async function focusSidebar(page: Page): Promise<void> {
    // In case the cody sidebar isn't focused, select it.
    while (!(await isSidebarVisible(page))) {
        await page.click('[aria-label="Cody"]')
    }
}

export async function expectAuthenticated(page: Page) {
    await focusSidebar(page)
    await expect(page.getByText('Chat alongside your code, attach files,')).toBeVisible()
}

// Selector for the Explorer button in the sidebar that would match on Mac and Linux
export const sidebarExplorer = (page: Page): Locator => page.getByRole('tab', { name: /Explorer.*/ })

/**
 * Use the command to toggle DND mode because the UI differs on Windows/non-Windows since 1.86 with
 * macOS appearing to use a native menu where Windows uses a VS Code-drawn menu.
 */
async function disableNotifications(page: Page): Promise<void> {
    await executeCommandInPalette(page, 'notifications: toggle do not disturb')
}

/**
 * Gets the chat panel frame locator.
 */
export function getChatPanel(page: Page): FrameLocator {
    return page.frameLocator('.simple-find-part-wrapper + iframe.webview').last().frameLocator('iframe')
}

/**
 * Create and open a new chat panel, and close the enhanced context settings window.
 * Returns the chat panel frame locator.
 */
export async function createEmptyChatPanel(
    page: Page
): Promise<[FrameLocator, Locator, Locator, Locator]> {
    await focusSidebar(page)
    await page.getByRole('button', { name: 'New Chat', exact: true }).click()

    // .simple-find-part-wrapper helps select for the webview in the panel rather than the sidebar
    const chatFrame = page
        .frameLocator('.simple-find-part-wrapper + iframe.webview')
        .last()
        .frameLocator('iframe')

    const chatInputs = chatFrame.getByRole('textbox', { name: 'Chat message' })

    return [chatFrame, chatInputs.last(), chatInputs.first(), chatInputs]
}

export function getChatInputs(chatPanel: FrameLocator): Locator {
    return chatPanel.getByRole('textbox', { name: 'Chat message' })
}

export async function focusChatInputAtEnd(chatInput: Locator): Promise<void> {
    await chatInput.focus()
    await chatInput.press('End')
}

export function chatMessageRows(chatPanel: FrameLocator): Locator {
    return chatPanel.locator('[role="row"]')
}

/**
 * Gets the chat context cell.
 */
export function getContextCell(chatPanel: FrameLocator): Locator {
    return chatPanel.locator('details', { hasText: 'Context' })
}

export function contextCellItems(contextCell: Locator): Locator {
    return contextCell.locator('[data-testid="context-item"]')
}

export async function expectContextCellCounts(
    contextCell: Locator,
    counts: { files: number; timeout?: number }
): Promise<void> {
    const summary = contextCell.locator('summary', { hasText: 'Context' })
    await expect(summary).toHaveAttribute(
        'title',
        `${counts.files} item${counts.files === 1 ? '' : 's'}`,
        { timeout: counts.timeout }
    )
}

export function atMentionMenuMessage(chatPanel: FrameLocator, text: string | RegExp): Locator {
    // Can't just use getByRole because the [cmdk-group-heading] is the aria-labelledby of the
    // [cmdk-group-items], which Playwright deems hidden when it is empty (because its height is 0),
    // but we still want to be able to get the label for testing even when the list below is empty.
    return chatPanel.locator(':is([cmdk-group-heading], [cmdk-empty])', { hasText: text })
}

export function chatInputMentions(chatInput: Locator): Locator {
    return chatInput.locator('.context-item-mention-node')
}

export async function openMentionsForProvider(
    frame: FrameLocator,
    chatInput: Locator,
    provider: string
): Promise<void> {
    await chatInput.press('@')
    await frame.getByRole('option', { name: provider }).click()
}

export function mentionMenuItems(chatFrame: FrameLocator): Locator {
    return chatFrame.locator('[cmdk-list] [role="option"]')
}

export async function selectMentionMenuItem(chatFrame: FrameLocator, title: string): Promise<void> {
    const item = chatFrame.locator('[cmdk-list] [role="option"]', { hasText: title })
    await item.click()
}

export async function openFileInEditorTab(page: Page, filename: string): Promise<void> {
    await page.keyboard.press('F1')
    // Without the leading `>`, the input is interpreted as a filename.
    await page.getByPlaceholder('Type the name of a command to run.').fill(filename)
    await expect(
        page
            .getByRole('listbox', { name: /^Search files/ })
            .getByRole('option')
            .first()
    ).toHaveAccessibleName(new RegExp(`${filename},`))
    await page.keyboard.press('Enter')

    await clickEditorTab(page, filename)
}

export async function clickEditorTab(
    page: Page,
    title: string,
    options: Partial<Parameters<Page['getByRole']>[1]> = {}
): Promise<void> {
    await page.getByRole('tab', { ...options, name: title }).click()
}

export async function selectLineRangeInEditorTab(
    page: Page,
    startLine: number,
    endLine?: number
): Promise<void> {
    const lineNumbers = page.locator('div[class*="line-numbers"]')
    await lineNumbers.getByText(startLine.toString(), { exact: true }).click()
    if (typeof endLine !== 'undefined') {
        await lineNumbers.getByText(endLine.toString(), { exact: true }).click({
            modifiers: ['Shift'],
        })
    }
}
