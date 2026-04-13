# PDF Library Findings

## Candidate: `react-to-pdf`

The `react-to-pdf` project is a viable short-path implementation for the L&M proposal page because it exports an existing React component directly from the browser and exposes both a hook and a direct function API. It also provides page format, margin, orientation, image quality, and `useCORS` overrides, which are relevant for a branded proposal surface with uploaded logo assets.

The main tradeoff is that the library creates the PDF from a screenshot of the rendered component rather than from vector content. That means it is well suited to making the downloaded file visually match the on-screen proposal layout, but text will not be vector-sharp in the same way as a document-native PDF renderer.

## Implication for this project

For this CSO L&M proposal workflow, the current requirement emphasizes that the PDF should visually match the public proposal page. Based on that requirement, `react-to-pdf` is a strong candidate for the immediate implementation, especially if the printable area is controlled and print-specific layout rules are added for clean pagination.

## Candidate: `@react-pdf/renderer`

The `@react-pdf/renderer` project is a much more established library and produces document-native PDFs using React components. It is strong when the PDF is treated as its own document system, but it requires building the PDF layout separately with its own primitives such as `Document`, `Page`, `View`, and `Text`.

## Comparison outcome

For this L&M proposal task, the key requirement is that the PDF download should closely match the existing on-screen `/proposal/:slug` presentation. Because `@react-pdf/renderer` would require recreating the proposal layout in a second rendering system, it increases implementation time and drift risk between the public page and the exported file.

By contrast, `react-to-pdf` is less sophisticated from a document-engine perspective, but it is better aligned with the current requirement to keep the export visually consistent with the live proposal page. The working recommendation is therefore to use `react-to-pdf` for the immediate implementation and to support it with print/export-friendly layout constraints on the proposal page.
