$.ajax({
    url: "http://localhost:8080/api/establecimientos",
    type: "GET",
    dataType: "json",
    success: function(data) {
        // Crear un array de objetos para DataTable
        let dataTableArray = [];
        $.each(data, function(index, value) {
            dataTableArray.push([
                value.nombre,
                value.codigoPostal,
                value.numero,
                value.calle,
                value.pais,
                value.ciudad,
                value.estado
            ]);
        });

        // Inicializar DataTable
        $('#establecimientos').DataTable({
            data: dataTableArray,
            "language": {
                "url": "https://cdn.datatables.net/plug-ins/1.13.5/i18n/es-MX.json",
                "emptyTable": "<div class='empty-table-message'>No hay establecimientos disponibles</div>",
                "zeroRecords": "No se encontraron coincidencias"
            },
            "paging": true,
            "searching": true,
            "ordering": true,
            "pageLength": 10,
            "responsive": true,
            "dom": '<"top-left"l><"top-right"f><"top-left"B>t<"bottom-left"i><"bottom-right"p>r',
            layout: {
                topStart: 'buttons'
            },
            buttons: [
                {
                    extend: 'collection',
                    className: 'custom-html-collection',
                    buttons: [
                        '<h3> == Exportar</h3>',
                        'pdf',
                        'print',
                        'excel',
                        'copy',
                        '<h3 class="not-top-heading"> == Visibilidad de columnas</h3>',
                        'colvis'
                    ]
                }
            ],
            columns: [
                { title: "Nombre" },
                { title: "Código Postal" },
                { title: "Número" },
                { title: "Calle" },
                { title: "Pais" },
                { title: "Ciudad" },
                { title: "Estado" }
            ]
        });
    }
});