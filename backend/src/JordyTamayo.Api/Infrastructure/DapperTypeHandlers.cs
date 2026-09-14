using System.Data;
using Dapper;
using Npgsql;
using NpgsqlTypes;

namespace JordyTamayo.Api.Infrastructure;

public sealed class DateOnlyTypeHandler : SqlMapper.TypeHandler<DateOnly>
{
    public override void SetValue(IDbDataParameter parameter, DateOnly value)
    {
        parameter.Value = value;
        if (parameter is NpgsqlParameter npgsqlParameter)
        {
            npgsqlParameter.NpgsqlDbType = NpgsqlDbType.Date;
        }
    }

    public override DateOnly Parse(object value) => value switch
    {
        DateOnly date => date,
        DateTime dateTime => DateOnly.FromDateTime(dateTime),
        string text => DateOnly.Parse(text),
        _ => throw new DataException($"No se pudo convertir {value.GetType().Name} a DateOnly.")
    };
}
