# Promoções dos mercados

`market-promotions-restricted-operator.sql` é o pacote aplicado no Supabase do Aqui Guaíra com a versão `20261108024705`. SHA-256 `9da83076a2d225bb76e266dca3a23e71f670055114b18e0c18645db4cae34f3a`.

Este registro fica fora das migrations automáticas. O pacote depende das funções de sessão, propriedade e administração de `aqui_private` e da RLS de `empresas` e `vagas`. A instalação exige autorização e verificação do destino em `AMBIENTE-DO-PROJETO.md`. O SQL recusa a reinstalação e não cria vínculos de operadores.
