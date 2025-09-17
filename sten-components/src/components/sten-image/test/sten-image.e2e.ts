import { newE2EPage } from '@stencil/core/testing';

describe('sten-image', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<sten-image></sten-image>');

    const element = await page.find('sten-image');
    expect(element).toHaveClass('hydrated');
  });
});
