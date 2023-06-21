import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [images, setImages] = useState({});
  const [idCounter, setIdCounter] = useState(1);

  const addMoveable = () => {
    // Create a new moveable component and add it to the array
    const COLORS = ["red", "blue", "yellow", "green", "purple"];

    setIdCounter(idCounter + 1);

    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        updateEnd: true,
      },
    ]);
  };

  const updateMoveable = (id, newComponent, updateEnd = false) => {
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });

    setMoveableComponents(updatedMoveables);
  };

  const handleResizeStart = (index, e) => {
    console.log("e", e.direction);
    // Check if the resize is coming from the left handle
    const [handlePosX, handlePosY] = e.direction;
    // 0 => center
    // -1 => top or left
    // 1 => bottom or right

    // -1, -1
    // -1, 0
    // -1, 1
    if (handlePosX === -1) {
      console.log("width", moveableComponents, e);
      // Save the initial left and width values of the moveable component
      const initialLeft = e.left;
      const initialWidth = e.width;

      // Set up the onResize event handler to update the left value based on the change in width
    }
  };

  return (
    <main style={{ height: "100vh", width: "100vw" }}>
      <button onClick={addMoveable}>Add Moveable1</button>
      <div
        id="parent"
        style={{
          position: "relative",
          background: "black",
          height: "80vh",
          width: "80vw",
        }}
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            handleResizeStart={handleResizeStart}
            setSelected={setSelected}
            isSelected={selected === item.id}
            updateEnd={item.updateEnd}
            idCounter={idCounter}
          />
        ))}
      </div>
    </main>
  );
};

export default App;

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  color,
  id,
  setSelected,
  isSelected = false,
  idCounter,
  updateEnd,
}) => {
  const placeHolderUrl = "https://jsonplaceholder.typicode.com/photos";
  const ref = useRef();
  const [image, setImage] = useState("");
  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    id,
  });

  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();

  const onResize = (e) => {
    // ACTUALIZAR ALTO Y ANCHO
    let newWidth = e.width;
    let newHeight = e.height;

    //NOTE:  VALIDAR POSICION DERECHA Y ABAJO
    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    // ACTUALIZAR NODO REFERENCIA
    const beforeTranslate = e.drag.beforeTranslate;

    const translateX = beforeTranslate[0];
    const translateY = beforeTranslate[1];
    //   const newTop = top + translateY < 0 ? 0 : top + translateY;
    //   const newLeft = left + translateX < 0 ? 0 : left + translateX;

    //NOTE: VALIDAR POSICION IZQUIERDA Y ARRIBA
    let newTop = top + translateY;
    let newLeft = left + translateX;

    if (newTop < 0) {
      newHeight += newTop;
      newTop = 0;
    }

    if (newLeft < 0) {
      newWidth += newLeft;
      newLeft = 0;
    }

    updateMoveable(id, {
      top: newTop,
      left: newLeft,
      width: newWidth,
      height: newHeight,
      color,
    });

    ref.current.style.width = `${newWidth}px`;
    ref.current.style.height = `${newHeight}px`;
    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;
    ref.current.style.backgroundImage = `url(${image})`;

    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      top: newTop,
      left: newLeft,
    });
  };

  const onDragHandler = async (e) => {
    //NOTE: VALIDAR MOVIMIENTO DENTRO DEL CONTENEDOR
    const positionMaxTop = e.top + height;
    const positionMaxLeft = e.left + width;

    if (positionMaxTop > parentBounds?.height)
      e.top = parentBounds?.height - height;
    if (positionMaxLeft > parentBounds?.width)
      e.left = parentBounds?.width - width;
    if (e.top < 0) e.top = 0;
    if (e.left < 0) e.left = 0;

    updateMoveable(id, {
      top: e.top,
      left: e.left,
      width,
      height,
      color,
    });
  };

  //NOTE : este evento causa problemas al redimenzionar el componente
  const onResizeEnd = async (e) => {
    let newWidth = e.lastEvent?.width;
    let newHeight = e.lastEvent?.height;
    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;
    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;
    const { lastEvent } = e;
    const { drag } = lastEvent;
    const { beforeTranslate } = drag;
    const absoluteTop = top + beforeTranslate[1];
    const absoluteLeft = left + beforeTranslate[0];

    updateMoveable(
      id,
      {
        top: absoluteTop,
        left: absoluteLeft,
        width: newWidth,
        height: newHeight,
        color,
      },
      true
    );
  };

  useEffect(() => {
    const getImage = async () => {
      try {
        const response = await fetch(placeHolderUrl + `/${idCounter}`);
        const { url } = await response.json();
        setImage(url + `/${idCounter}`);
      } catch (error) {
        console.log(error);
      }
    };
    getImage();
  }, []);

  return (
    <>
      <div
        ref={ref}
        className="draggable"
        id={"component-" + id}
        style={{
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height,
          backgroundImage: `url(${image})`,
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
        }}
        onClick={() => setSelected(id)}
      />

      <Moveable
        target={isSelected && ref.current}
        resizable
        draggable
        onDrag={onDragHandler}
        onResize={onResize}
        // onResizeEnd={onResizeEnd}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={false}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
      />
    </>
  );
};
