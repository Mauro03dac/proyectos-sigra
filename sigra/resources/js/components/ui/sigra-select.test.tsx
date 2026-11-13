import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SigraSelect } from './sigra-select';

describe('SigraSelect', () => {
    it('serializa el identificador seleccionado con su nombre de campo', () => {
        const markup = renderToStaticMarkup(
            <SigraSelect
                name="linea_productiva_principal"
                value="19"
                options={[
                    { value: '19', label: 'Agrícola' },
                    { value: '20', label: 'Pecuario' },
                ]}
            />,
        );

        expect(markup).toContain('name="linea_productiva_principal"');
        expect(markup).toContain('<option value="19" selected="">Agrícola</option>');
    });
});
