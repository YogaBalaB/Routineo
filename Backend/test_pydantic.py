from pydantic import BaseModel, Field, ConfigDict
class M(BaseModel):
    model_config=ConfigDict(serialize_by_alias=False)
    x: str = Field(alias='y')

m = M(y='val')
print(f"by_alias=True: {m.model_dump(by_alias=True)}")
print(f"by_alias=False: {m.model_dump(by_alias=False)}")
