-- Carga demonstrativa mínima para exercitar os indicadores do Dashboard.
-- A V1 permanece intacta; esta migration somente acrescenta registros.

INSERT INTO veiculos (placa, modelo, tipo, ano)
VALUES
    ('DEF-4567', 'Volkswagen Delivery', 'LEVE', 2024),
    ('GHI-7890', 'Scania P360', 'PESADO', 2024);

INSERT INTO viagens (
    veiculo_id,
    data_saida,
    data_chegada,
    origem,
    destino,
    km_percorrida
)
SELECT v.id, TIMESTAMP '2026-09-03 06:30:00', TIMESTAMP '2026-09-03 14:30:00',
       'Campinas', 'Ribeirão Preto', 420.00
FROM veiculos v
WHERE v.placa = 'DEF-4567';

INSERT INTO viagens (
    veiculo_id,
    data_saida,
    data_chegada,
    origem,
    destino,
    km_percorrida
)
SELECT v.id, TIMESTAMP '2026-09-04 05:30:00', TIMESTAMP '2026-09-04 18:00:00',
       'Porto Alegre', 'Curitiba', 900.00
FROM veiculos v
WHERE v.placa = 'GHI-7890';

INSERT INTO viagens (
    veiculo_id,
    data_saida,
    data_chegada,
    origem,
    destino,
    km_percorrida
)
SELECT v.id, TIMESTAMP '2026-09-11 05:00:00', TIMESTAMP '2026-09-12 10:00:00',
       'Curitiba', 'São Paulo', 650.00
FROM veiculos v
WHERE v.placa = 'GHI-7890';

INSERT INTO manutencoes (
    veiculo_id,
    data_inicio,
    data_finalizacao,
    tipo_servico,
    custo_estimado,
    status,
    observacao
)
SELECT v.id, DATE '2026-10-05', DATE '2026-10-06',
       'Revisão preventiva', 480.50, 'PENDENTE',
       'Verificar fluidos e itens de segurança.'
FROM veiculos v
WHERE v.placa = 'ABC-1234';

INSERT INTO manutencoes (
    veiculo_id,
    data_inicio,
    data_finalizacao,
    tipo_servico,
    custo_estimado,
    status,
    observacao
)
SELECT v.id, DATE '2026-10-09', DATE '2026-10-10',
       'Troca de óleo', 1250.00, 'EM_REALIZACAO',
       'Aguardando conclusão da troca e descarte do óleo.'
FROM veiculos v
WHERE v.placa = 'XYZ-9876';

INSERT INTO manutencoes (
    veiculo_id,
    data_inicio,
    data_finalizacao,
    tipo_servico,
    custo_estimado,
    status,
    observacao
)
SELECT v.id, DATE '2026-10-16', DATE '2026-10-17',
       'Inspeção de freios', 350.00, 'CONCLUIDA',
       'Priorizar a verificação das pastilhas dianteiras.'
FROM veiculos v
WHERE v.placa = 'DEF-4567';

INSERT INTO manutencoes (
    veiculo_id,
    data_inicio,
    data_finalizacao,
    tipo_servico,
    custo_estimado,
    status,
    observacao
)
SELECT v.id, DATE '2026-11-03', DATE '2026-11-04',
       'Revisão elétrica', 540.00, 'PENDENTE',
       'Avaliar bateria, alternador e iluminação.'
FROM veiculos v
WHERE v.placa = 'GHI-7890';
