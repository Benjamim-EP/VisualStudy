(function (d3) {
    'use strict';
  
    // Generated with https://paletton.com/#uid=75x0u0kigkU8ZuBdTpdmbh6rjc7
    const colors = [
      ['#9D4452', '#E6A6B0', '#BE6B78', '#812836', '#5B0D1A'],
      ['#A76C48', '#F4CAAF', '#C99372', '#884E2A', '#602E0E'],
      ['#2E6B5E', '#719D93', '#498175', '#1B584A', '#093E32'],
      ['#538E3D', '#A6D096', '#75AC61', '#3A7424', '#1F520C'],
      ['#008459', '#00C585', '#00A06C', '#066748', '#1F520C'],
      ['#570684','#8001C6','#6904A1','#470C68','#300F42'],

    ];
  
    const nodes = [];
    const links = [];
  
    const MAIN_NODE_SIZE = 50;
    const CHILD_NODE_SIZE = 15;
    const LEAF_NODE_SIZE = 5;
    const DEFAULT_DISTANCE = 150;
    const MAIN_NODE_DISTANCE = 200;
    const LEAF_NODE_DISTANCE = 150;
    const MANY_BODY_STRENGTH = -10;
  
    let i = 0;
  
    const addMainNode = (node) => {
      node.size = node.importancia * 10;
      node.color = i == 6? colors[i=1][1] : colors[i++][1];
      nodes.push(node);
    };
  
  
  
    const addChildNode = (
      parentNode,
      childNode,
      size = CHILD_NODE_SIZE,
      distance = DEFAULT_DISTANCE
    ) => {
      childNode.size = size;
      childNode.color = parentNode.color;
      nodes.push(childNode);
      links.push({
        source: parentNode,
        target: childNode,
        distance,
        color: parentNode.color,
      });
    };
    const assembleChildNode = (parentNode, id, numLeaves=20) => {
      const childNode = { id };
      addChildNode(parentNode, childNode);
  
      for (let i = 0; i < numLeaves; i++) {
        addChildNode(childNode, { id: '' }, LEAF_NODE_SIZE, LEAF_NODE_DISTANCE);
      }
    };
  
    const connectMainNodes = (source, target,link2) => {

      links.push({
        source,
        target,
        distance: MAIN_NODE_DISTANCE,
        color: source.color,
        text : link2? source.textolink2:source.textolink
      });
    };

    
    
    d3.csv("data.csv")
    .then(data => {
      
      let nos = [] 
      data.map((valor) => {
        const no = {id: valor.id, text: valor.text, importancia: valor.importancia , textolink:valor.textolink, textolink2:valor.textolink2}
        nos.push(no)
        // Criar Node
        addMainNode(no) 
      })
      
      data.map((valor)=>{
        // Criar Link entre Nodes
        const no1 = nos.find((n) => n.id == valor.id)
        const no2 = nos.find((n) => n.id == valor.linkto)

        const no3 = nos.find((n) => n.id == valor.id)
        const no4 = nos.find((n) => n.id == valor.linkto2)
        
        no2? connectMainNodes(no1,no2,false):null;
        no4? connectMainNodes(no3,no4,true):null;
        
      })


      /*
      console.log(b)
      const coordinacion = { id: 'Coordinacion', text: "texto coordinaction" };
      addMainNode(coordinacion);
    
    
      const equipoComercial = { id: 'Comercial', text:"texto commercial" };
      addMainNode(equipoComercial);
      assembleChildNode(equipoComercial, 'Ventas', 1);
      assembleChildNode(equipoComercial, 'Marketing', 2);
      /*
    
    
    
    
      const areaTecnica = { id: 'Area Tecnica', text:"texto area tecnica" };
      addMainNode(areaTecnica);
      assembleChildNode(areaTecnica, 'R&D',3);
      assembleChildNode(areaTecnica, 'Ingenieria',2);
    
    
      const admin = { id: 'Finanzas', text:"texto Finanzas" };
      addMainNode(admin);
      assembleChildNode(admin, 'Contable', 1);
      assembleChildNode(admin, 'RRHH', 1);
      assembleChildNode(admin, 'Compras', 1);
    
    
      const it = {id: 'IT', text:"texti IT"};
      addMainNode(it);
      assembleChildNode(it,'Admin IT',1);
    
    
    
    
      connectMainNodes(coordinacion, equipoComercial);
      connectMainNodes(coordinacion,it); 
      connectMainNodes(coordinacion, areaTecnica);
      connectMainNodes(areaTecnica,it); 
      connectMainNodes(equipoComercial,it); 
      connectMainNodes(admin, coordinacion);
      connectMainNodes(admin, it);
      connectMainNodes(admin, coordinacion);
      */
      const svg = d3.select('#container');
      const width = +svg.attr('width');
      const height = +svg.attr('height');
      const centerX = width / 2;
      const centerY = height / 2;
    
      const simulation = d3.forceSimulation(nodes)
        .force('charge', d3.forceManyBody().strength(MANY_BODY_STRENGTH))
        .force(
          'link',
          d3.forceLink(links).distance((link) => link.distance)
        )
        .force('center', d3.forceCenter(centerX, centerY));
    
      const dragInteraction = d3.drag().on('drag', (event, node) => {
        
        node.fx = event.x > width ? width : event.x;
        if(event.y > 0)
          node.fy = event.y > height ? height : event.y;
        simulation.alpha(1);
        simulation.restart();
      });
      //console.log(svg)
      
      const lines = svg
        .selectAll('line')
        .data(links)
        .enter()
        .append('line')
        .attr('stroke', (link) => link.color || 'black')
        .attr("stroke-width", 5)
        .on('mouseover',mouseover)
        .on('mouseout',mouseout);
        
      
      const circles = svg
        .selectAll('circle')
        .data(nodes)
        .enter()
        .append('circle')
        .attr('fill', (node) => node.color || 'gray')
        .attr('r', (node) => node.size)
        .on('mouseover',mouseover)
        .on('mouseout',mouseout)
        .call(dragInteraction);
                
      const text = svg
        .selectAll('text')
        .data(nodes)
        .enter()
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .style('pointer-events', 'none')
        .text((node) => node.id);
    

      simulation.on('tick', () => {
        circles.attr('cx', (node) => node.x).attr('cy', (node) => node.y);
        text.attr('x', (node) => node.x).attr('y', (node) => node.y);
    
        lines
          .attr('x1', (link) => link.source.x)
          .attr('y1', (link) => link.source.y)
          .attr('x2', (link) => link.target.x)
          .attr('y2', (link) => link.target.y);

    

      });


      var texto = document.createElement('div');
      texto.className = 'textoPrincipal';
      texto.style.cssText = 'position:absolute';
      texto.style.fontSize = '30px'
      document.body.appendChild(texto);

      function mostrarTexto(d,o){
          
        texto.textContent = d.text

      }
      function ocultarTexto(d,o){
          texto.textContent = ''
      }

      function mouseover(d) {
          d3.selectAll("circle").transition().duration(500)
          .style("opacity", function(o) {

              mostrarTexto(d.toElement.__data__,o)
              //return d;
          })
          
            
      }

      function mouseout(d) {
          d3.selectAll("circle").transition().duration(500)
          .style("opacity",(o)=>{ ocultarTexto(d.toElement.__data__,o)})
      }
    
      });

    
  }(d3));
  