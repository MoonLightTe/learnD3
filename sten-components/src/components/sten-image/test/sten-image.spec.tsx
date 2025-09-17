import { newSpecPage } from '@stencil/core/testing';
import { StenImage } from '../sten-image';

describe('sten-image', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [StenImage],
      html: `<sten-image></sten-image>`,
    });
    expect(page.root).toEqualHtml(`
      <sten-image>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </sten-image>
    `);
  });
});
