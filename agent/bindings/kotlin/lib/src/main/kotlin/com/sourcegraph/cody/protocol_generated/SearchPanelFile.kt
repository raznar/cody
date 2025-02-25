@file:Suppress("FunctionName", "ClassName", "unused", "EnumEntryName", "UnusedImport")
package com.sourcegraph.cody.protocol_generated;

data class SearchPanelFile(
  val uri: Uri,
  val snippets: List<SearchPanelSnippet>,
)

